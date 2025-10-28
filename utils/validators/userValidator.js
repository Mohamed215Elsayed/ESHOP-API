import slugify from 'slugify';
import bcrypt from 'bcrypt';
import { check, body } from 'express-validator';
import validatorMiddleware from '../../middlewares/validatorMiddleware.js';
import { mongoIdValidator } from './mongoIdValidator.js';
import UserModel from '../../models/UserModel.js';

/** ---------- Helper Validators ---------- **/

// Common name slugify logic
const nameSlugifier = (val, { req }) => {
  req.body.slug = slugify(val);
  return true;
};

// Shared email validator factory
const emailValidator = (isOptional = false) => {
  let chain = check('email');
  if (isOptional) chain = chain.optional(); // ✅ optional only when updating

  return chain
    .notEmpty()
    .withMessage('Email required')
    .isEmail()
    .withMessage('Invalid email address')
    .custom(async (val, { req }) => {
      // Check if email exists for another user
      const existingUser = await UserModel.findOne({ email: val });
      if (existingUser && existingUser._id.toString() !== req.params?.id) {
        throw new Error('E-mail already in use');
      }
      return true;
    });
};

// Phone validator (Egypt & Saudi Arabia)
const phoneValidator = check('phone')
  .optional()
  .isMobilePhone(['ar-EG', 'ar-SA'])
  .withMessage('Invalid phone number — only Egyptian or Saudi numbers are accepted');

/** ---------- Create User Validator ---------- **/
export const createUserValidator = [
  check('name')
    .notEmpty()
    .withMessage('User name is required')
    .isLength({ min: 3 })
    .withMessage('Too short User name')
    .custom(nameSlugifier),

  emailValidator(false), // ✅ required on create
  phoneValidator,

  check('password')
    .notEmpty()
    .withMessage('Password required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        throw new Error('Password Confirmation incorrect');
      }
      return true;
    }),

  check('passwordConfirm').notEmpty().withMessage('Password confirmation required'),

  check('profileImg').optional(),
  check('role').optional(),

  validatorMiddleware,
];

/** ---------- Update User Validator ---------- **/
export const updateUserValidator = [
  mongoIdValidator('id', 'User'),
  body('name').optional().custom(nameSlugifier),
  emailValidator(true), // ✅ optional on update
  phoneValidator,
  check('profileImg').optional(),
  check('role').optional(),
  validatorMiddleware,
];
export const getUserValidator = [mongoIdValidator('id', 'User'), validatorMiddleware];
/** ---------- Delete User Validator ---------- **/
export const deleteUserValidator = [mongoIdValidator('id', 'User'), validatorMiddleware];

/** ---------- Change User Password Validator by admin ---------- **/
export const changeUserPasswordValidator = [
  mongoIdValidator('id', 'User'),
  body('currentPassword').notEmpty().withMessage('You must enter your current password'),
  body('passwordConfirm').notEmpty().withMessage('You must enter the password confirmation'),
  body('password')
    .notEmpty()
    .withMessage('You must enter a new password')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .custom(async (newPassword, { req }) => {
      const user = await UserModel.findById(req.params.id).select('+password'); //returns user with password even if not active(hidden)
      if (!user) throw new Error('There is no user for this ID');

      if (!req.body.currentPassword) {
        throw new Error('Current password is required');
      }

      const isCorrectPassword = await bcrypt.compare(req.body.currentPassword, user.password);

      if (!isCorrectPassword) throw new Error('Incorrect current password');
      if (newPassword === req.body.currentPassword) {
        throw new Error('New password must be different from the current password');
      }
      if (newPassword !== req.body.passwordConfirm) {
        throw new Error('Password confirmation does not match');
      }

      return true;
    }),

  validatorMiddleware,
];

/** ---------- Update Logged User Validator ---------- **/
export const updateLoggedUserValidator = [
  body('name').optional().custom(nameSlugifier),
  emailValidator(true), // ✅ optional for logged user update
  phoneValidator,
  validatorMiddleware,
];
