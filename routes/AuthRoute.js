import express from 'express';
import { signupValidator, loginValidator } from '../utils/validators/authValidator.js';

import {
  signup,
  login,
  protect,
  forgotPassword,
  verifyPassResetCode,
  resetPassword,
  // googleAuthCallback,//
} from '../controllers/AuthController.js';
import passport from 'passport';//
const router = express.Router();

router.post('/signup', signupValidator, signup);
router.post('/login', loginValidator, login);
router.post('/forgotPassword', forgotPassword);
router.post('/verifyResetCode', verifyPassResetCode);
router.put('/resetPassword', resetPassword);

// // Start Google Login
// router.get(
//   '/google',
//   passport.authenticate('google', {
//     scope: ['profile', 'email'],
//   })
// );

// // Google Callback
// router.get(
//   '/google/callback',
//   passport.authenticate('google', {
//     session: false,
//     failureRedirect: `${process.env.CLIENT_URL}/login`,
//   }),
//   googleAuthCallback
// );

export default router;
