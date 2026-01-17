import asyncHandler from 'express-async-handler';
import UserModel from '../models/UserModel.js';
import ApiError from '../utils/apiError.js';

/**
 * @desc    Add address to user's address list
 * @route   POST /api/v1/addresses
 * @access  Protected/User
 */
export const addAddress = asyncHandler(async (req, res, next) => {
  const { city, postalCode, details, alias, phone } = req.body;

  if (!city || !postalCode || !details || !alias || !phone) {
    return next(new ApiError('Please provide complete address details', 400));
  }
  // $addToSet => add address object to user addresses  array if address not exist
  // $addToSet prevents duplicate objects
  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { addresses: req.body } },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new ApiError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Address added successfully.',
    data: user.addresses,
  });
});

/**
 * @desc    Remove address from user's address list
 * @route   DELETE /api/v1/addresses/:addressId
 * @access  Protected/User
 */
export const removeAddress = asyncHandler(async (req, res, next) => {
  const { addressId } = req.params;

  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    { $pull: { addresses: { _id: addressId } } },
    { new: true }
  );

  if (!user) {
    return next(new ApiError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Address removed successfully.',

    data: user.addresses,
  });
});

/**
 * @desc    Get logged-in user's address list
 * @route   GET /api/v1/addresses
 * @access  Protected/User
 */
export const getLoggedUserAddresses = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findById(req.user._id);

  if (!user) {
    return next(new ApiError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    results: user.addresses.length,
    data: user.addresses,
  });
});
/**
 * @desc    Get a single address by ID
 * @route   GET /api/v1/addresses/:addressId
 * @access  Protected/User
 */
export const getAddressById = asyncHandler(async (req, res, next) => {
  const { addressId } = req.params;

  const user = await UserModel.findById(req.user._id);

  if (!user) {
    return next(new ApiError('User not found', 404));
  }

  const address = user.addresses.id(addressId);

  if (!address) {
    return next(new ApiError('Address not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: address,
  });
});
/**
 * @desc    Update a single address by ID
 * @route   PUT /api/v1/addresses/:addressId
 * @access  Protected/User
 */
export const updateAddress = asyncHandler(async (req, res, next) => {
  const { addressId } = req.params;
  const { alias, details, phone, city, postalCode } = req.body;

  const user = await UserModel.findById(req.user._id);
  if (!user) {
    return next(new ApiError('User not found', 404));
  }

  const address = user.addresses.id(addressId);
  if (!address) {
    return next(new ApiError('Address not found', 404));
  }

  // تحديث القيم
  if (alias) address.alias = alias;
  if (details) address.details = details;
  if (phone) address.phone = phone;
  if (city) address.city = city;
  if (postalCode) address.postalCode = postalCode;

  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Address updated successfully',
    data: address,
  });
});
