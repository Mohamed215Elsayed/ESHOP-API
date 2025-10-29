import asyncHandler from 'express-async-handler';
import UserModel from '../models/UserModel.js';
import ApiError from '../utils/apiError.js';

/**
 *@desc  🛍️ Add Product to Wishlist
 *@route   POST /api/v1/wishlist
 *@access  Protected (User)
 */
export const addProductToWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.body;

  if (!productId) {
    return next(new ApiError('Product ID is required', 400));
  }
  // $addToSet => Adds productId only if it doesn’t already exist in wishlist
  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { wishlist: productId } }, // prevents duplicates automatically
    { new: true, runValidators: true }
  ).populate('wishlist');

  if (!user) return next(new ApiError('User not found', 404));

  res.status(200).json({
    status: 'success',
    message: '✅ Product added successfully to your wishlist.',
    data: user.wishlist,
  });
});

/* ----------------------------------------------------
   ❌ Remove Product from Wishlist
   @route   DELETE /api/v1/wishlist/:productId
   @access  Protected (User)
---------------------------------------------------- */
export const removeProductFromWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  // $pull => Removes productId from wishlist if it exists
  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    { $pull: { wishlist: productId } },
    { new: true }
  ).populate('wishlist');

  if (!user) return next(new ApiError('User not found', 404));

  res.status(200).json({
    status: 'success',
    message: '🗑️ Product removed successfully from your wishlist.',
    data: user.wishlist,
  });
});

/* ----------------------------------------------------
   👤 Get Logged User Wishlist
   @route   GET /api/v1/wishlist
   @access  Protected (User)
---------------------------------------------------- */
export const getLoggedUserWishlist = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findById(req.user._id).populate('wishlist');

  if (!user) return next(new ApiError('User not found', 404));

  res.status(200).json({
    status: 'success',
    results: user.wishlist.length,
    data: user.wishlist,
  });
});
