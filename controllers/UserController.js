import createToken from '../utils/createToken.js';
import asyncHandler from 'express-async-handler';
import ApiError from '../utils/apiError.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';
/* --------------------------------------------------------------------- */
import UserModel from '../models/UserModel.js';
import * as factory from '../services/handlersFactory.js';
/* ----------------------------------------------------
   🖼️ Image Upload & Processing
---------------------------------------------------- */
import { createImageProcessor } from '../middlewares/imageHandler.js';
const { upload, resize } = createImageProcessor({
  folder: 'users',
  prefix: 'user',
  fieldName: 'profileImg',
});

export const uploadUserImage = upload;
export const resizeUserImage = resize;

/* ----------------------------------------------------
   👥 User CRUD Operations (Admin)
---------------------------------------------------- */
export const getUsers = factory.getAll(UserModel, 'User');
export const getUser = factory.getOne(UserModel);
export const createUser = factory.createOne(UserModel);
export const deleteUser = factory.deleteOne(UserModel);

export const updateUser = asyncHandler(async (req, res, next) => {
  const updatedUser = await UserModel.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      slug: req.body.slug,
      phone: req.body.phone,
      email: req.body.email,
      profileImg: req.body.profileImg,
      role: req.body.role,
    },
    { new: true }
  );

  if (!updatedUser) {
    return next(new ApiError(`No user found with ID: ${req.params.id}`, 404));
  }

  res.status(200).json({ data: updatedUser });
});

/* ----------------------------------------------------
   🔐 Password Management
---------------------------------------------------- */
export const changeUserPassword = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    { new: true }
  );

  if (!user) {
    return next(new ApiError(`No user found with ID: ${req.params.id}`, 404));
  }

  res.status(200).json({ data: user });
});

/* ----------------------------------------------------
   🙍‍♂️ Logged User Operations (Self-service)
   @desc    Get Logged user data
   @route   GET /api/v1/users/getMe
   @access  Private/Protect
---------------------------------------------------- */
export const getLoggedUserData = asyncHandler((req, res, next) => {
  req.params.id = req.user._id;
  next();
});

// @desc    Update logged user password
// @route   PUT /api/v1/users/changeMyPassword
// @access  Private/Protect
export const updateLoggedUserPassword = asyncHandler(async (req, res) => {
  // 1) Update user password based user payload (req.user._id)
  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    { new: true }
  );
  // 2) Generate token
  const token = createToken(user._id);
  res.status(200).json({ data: user, token });
});

// @desc    Update logged user data (without password, role)
// @route   PUT /api/v1/users/updateMe
// @access  Private/Protect
export const updateLoggedUserData = asyncHandler(async (req, res) => {
  const updatedUser = await UserModel.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    },
    { new: true }
  );

  res.status(200).json({ data: updatedUser });
});

// @desc    Deactivate logged user
// @route   DELETE /api/v1/users/deleteMe
// @access  Private/Protect
export const deleteLoggedUserData = asyncHandler(async (req, res) => {
  await UserModel.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({ status: 'success' });
});
// // @desc    Reactivate logged user account
// // @route   PATCH /api/v1/users/activateMe
// // @access  Private/Protect
// export const activateLoggedUserData = asyncHandler(async (req, res, next) => {
//   const user = await UserModel.findByIdAndUpdate(req.user._id, { active: true }, { new: true });

//   if (!user) {
//     return next(new ApiError('User not found', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     message: 'Account reactivated successfully',
//     data: user,
//   });
// });

/* ----------------------------------------------------
   📩 Request Account Activation Code
   @route   POST /api/v1/users/requestActivation
   @access  Private/Protect
---------------------------------------------------- */
export const requestActivationCode = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findById(req.user._id);
  if (!user) return next(new ApiError('User not found', 404));

  if (user.active) return next(new ApiError('Account is already active', 400));

  // Generate a 6-digit activation code
  const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedCode = crypto.createHash('sha256').update(activationCode).digest('hex');

  user.activationCode = hashedCode;
  user.activationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  user.activationVerified = false;
  await user.save();

  // Send code via email
  const message = `Hi ${user.name},\nUse this code to reactivate your account:\n${activationCode}\nIt expires in 10 minutes.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Account Reactivation Code',
      message,
    });
  } catch (err) {
    user.activationCode = undefined;
    user.activationCodeExpires = undefined;
    user.activationVerified = undefined;
    await user.save();
    return next(new ApiError('Error sending activation email', 500));
  }

  res.status(200).json({
    status: 'success',
    message: 'Activation code sent to your email',
  });
});

/* ----------------------------------------------------
   🔓 Activate Account
   @route   PATCH /api/v1/users/activateMe
   @access  Private/Protect
---------------------------------------------------- */
export const activateLoggedUserData = asyncHandler(async (req, res, next) => {
  const { code } = req.body;
  if (!code) return next(new ApiError('Please provide the activation code', 400));

  const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

  const user = await UserModel.findOne({
    _id: req.user._id,
    activationCode: hashedCode,
    activationCodeExpires: { $gt: Date.now() },
  });

  if (!user) return next(new ApiError('Invalid or expired activation code', 400));

  user.active = true;
  user.activationCode = undefined;
  user.activationCodeExpires = undefined;
  user.activationVerified = true;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Account reactivated successfully',
    data: user,
  });
});
