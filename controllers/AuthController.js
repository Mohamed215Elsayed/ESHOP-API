import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/sendEmail.js';
import bcrypt from 'bcrypt';
import asyncHandler from 'express-async-handler';
import ApiError from '../utils/apiError.js';
import createToken from '../utils/createToken.js';
import getTokenFromHeaders from '../utils/getTokenFromHeaders.js';
import UserModel from '../models/UserModel.js';
import sanatizeUser from '../utils/sanatizeData.js';

// export const googleAuthCallback = asyncHandler(async (req, res, next) => {
//   try {
//     const { email, googleId, name, avatar } = req.user;

//     // 1️⃣ دور على المستخدم بالإيميل
//     let user = await UserModel.findOne({ email });

//     // 2️⃣ لو المستخدم موجود ومسجل بالطريقة العادية → ربط Google
//     if (user && user.provider === 'local' && !user.googleId) {
//       user.googleId = googleId; // ربط Google ID
//       user.provider = 'google'; // تحديث المزود للحساب
//       await user.save();
//     }

//     // 3️⃣ لو مستخدم جديد → إنشاء حساب جديد
//     if (!user) {
//       user = await UserModel.create({
//         name,
//         email,
//         googleId,
//         avatar,
//         provider: 'google',
//         active: true,
//         termsAccepted: true,
//         termsAcceptedAt: new Date(),
//       });
//     }

//     // 4️⃣ إنشاء JWT
//     const token = createToken(user._id);

//     // 5️⃣ إعادة توجيه للفرونت مع التوكن
//     res.redirect(`${process.env.CLIENT_URL}/login?token=${token}`);
//   } catch (err) {
//     console.error('Google Auth Callback Error:', err);
//     res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
//   }
// });

/** -----------------------------
 * 🧠 Signup
 * @route POST /api/v1/auth/signup
 * @access Public
 * ----------------------------- **/
export const signup = asyncHandler(async (req, res, next) => {
  const { name, email, phone, password, termsAccepted } = req.body;
  const isTermsAccepted = termsAccepted === true || termsAccepted === 'true';
  if (!isTermsAccepted) {
    return next(new ApiError('You must accept terms and privacy policy', 400));
  }
  // const existingUser = await UserModel.findOne({ email });
  const existingUser = await UserModel.exists({ email }); //استخدم lean check للإيميل (أسرع)  \\⚡ أسرع وأخف من findOne
  if (existingUser) {
    return next(new ApiError('Email already exists', 400));
  }
  const user = await UserModel.create({
    name,
    email,
    phone,
    password,
    // ✅ Terms
    termsAccepted: isTermsAccepted,
    termsAcceptedAt: new Date(),
    termsVersion: '1.0',
  });
  const token = createToken(user._id);
  // res.status(201).json({ data: sanatizeUser(user), token });
  res.status(201).json({
    status: 'success',
    message: 'Account created successfully',
    data: sanatizeUser(user),
    token,
  });
});

/** -----------------------------
 * 🔐 Login
 * @route POST /api/v1/auth/login
 * @access Public
 * ----------------------------- **/
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ApiError('Please provide email and password', 400));
  }
  // const user = await UserModel.findOne({ email }).select('+password'); // 👈 include password if it's excluded in schema;
  const user = await UserModel.findOne({ email, active: true }).select('+password');

  if (!user) {
    return next(new ApiError('Incorrect email or password', 401));
  }
  //   const isPasswordCorrect = await bcrypt.compare(password, user.password);
  const isPasswordCorrect = await user.correctPassword(password, user.password);
  if (!isPasswordCorrect) {
    return next(new ApiError('Incorrect email or password', 401));
  }
  const token = createToken(user._id);
  //   const userData = user.toObject();
  //   delete userData.password;
  const { password: _, ...userData } = user.toObject();
  res.status(200).json({
    status: 'success',
    message: 'Logged in successfully',
    // data: userData,
    data: sanatizeUser(user),
    token,
  });
});

/** -----------------------------
 * 🧭 Protect Middleware
 * Ensure user is logged in & token valid
 * ----------------------------- **/
export const protect = asyncHandler(async (req, res, next) => {
  const token = getTokenFromHeaders(req);
  if (!token) {
    return next(new ApiError('You are not logged in. Please log in first.', 401));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const currentUser = await UserModel.findById(decoded.userId);
  if (!currentUser) {
    return next(new ApiError('The user belonging to this token no longer exists.', 401));
  }
  //   if (currentUser.passwordChangedAt) {
  //     const passwordChangedTimestamp = Math.floor(currentUser.passwordChangedAt.getTime() / 1000);
  //     if (passwordChangedTimestamp > decoded.iat) {
  //       return next(new ApiError('Password recently changed. Please log in again.', 401));
  //     }
  //   }
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new ApiError('Password recently changed. Please log in again.', 401));
  }

  req.user = currentUser;
  next();
});

/** -----------------------------
 * 🛂 Role-Based Authorization
 *  1) access roles
 *  2) access registered user (req.user.role)
 * ----------------------------- **/
export const allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError('You are not authorized to access this route', 403));
    }
    next();
  });

/** -----------------------------
 * ✉️ Forgot Password
 * @route POST /api/v1/auth/forgotPassword
 * @access Public
 * ----------------------------- **/
export const forgotPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user by email
  const { email } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) {
    return next(new ApiError(`No user found with email: ${email}`, 404));
  }
  if (user.provider === 'google') {
    return next(
      new ApiError('This account uses Google login. Password reset is not available.', 400)
    );
  }

  // 2) If user exist, Generate hash reset random 6 digits and save it in db
  const resetCode = crypto.randomInt(100000, 1000000).toString();
  // const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto.createHash('sha256').update(resetCode).digest('hex');
  user.passwordResetCode = hashedResetCode;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 min
  user.passwordResetVerified = false;
  await user.save();
  const message = `
      Hi ${user.name},
      We received a request to reset your password.
      Your reset code is: ${resetCode}
      This code is valid for 10 minutes.
      — The E-Shop Team
    `;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset code (valid for 10 min)',
      message,
    });
    res.status(200).json({
      status: 'Success',
      message: 'Reset code sent to your email',
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;
    await user.save();
    return next(new ApiError('Error sending email. Please try again later.', 500));
  }
});

/** -----------------------------
 * ✅ Verify Reset Code
 * @route POST /api/v1/auth/verifyResetCode
 * @access Public
 * ----------------------------- **/
export const verifyPassResetCode = asyncHandler(async (req, res, next) => {
  const hashedResetCode = crypto.createHash('sha256').update(req.body.resetCode).digest('hex');

  const user = await UserModel.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiError('Reset code invalid or expired', 400));
  }

  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({ status: 'Success', message: 'Code verified successfully' });
});

/** -----------------------------
 * 🔁 Reset Password
 * @route POST /api/v1/auth/resetPassword
 * @access Public
 * ----------------------------- **/
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, newPassword } = req.body;
  // 1) Get user based on email
  const user = await UserModel.findOne({ email });
  if (!user) {
    return next(new ApiError(`No user found with email: ${email}`, 404));
  }
  // 2) Check if reset code verified
  if (!user.passwordResetVerified) {
    return next(new ApiError('Reset code not verified', 400));
  }

  user.password = newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;

  await user.save();
  // 3) if everything is ok, generate token
  const token = createToken(user._id);
  res.status(200).json({ status: 'Success', token });
});
