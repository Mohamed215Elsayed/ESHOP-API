import express from 'express';
import { signupValidator, loginValidator } from '../utils/validators/authValidator.js';

import {
  signup,
  login,
  protect,
  forgotPassword,
  verifyPassResetCode,
  resetPassword,
} from '../controllers/AuthController.js';

const router = express.Router();

router.post('/signup', signupValidator, signup);
router.post('/login', loginValidator, login);
router.post('/forgotPassword', forgotPassword);
router.post('/verifyResetCode', verifyPassResetCode);
router.put('/resetPassword', resetPassword);

export default router;
