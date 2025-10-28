import { check, param } from 'express-validator';
import validatorMiddleware from '../../middlewares/validatorMiddleware.js';

/**
 * @desc    Validate add address request
 * @method  POST /api/v1/addresses
 */
export const addAddressValidator = [
  check('alias')
    .notEmpty()
    .withMessage('Alias (e.g. home, work) is required')
    .isString()
    .withMessage('Alias must be a string')
    .isLength({ min: 3 })
    .withMessage('Alias must be at least 3 characters long')
    .isLength({ max: 32 })
    .withMessage('Alias must not exceed 32 characters')
    .trim(),

  check('details')
    .notEmpty()
    .withMessage('Address details are required')
    .isString()
    .withMessage('Address details must be a string'),

  check('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone(['ar-EG', 'ar-SA'])
    .withMessage('Invalid phone number'),

  check('city')
    .notEmpty()
    .withMessage('City is required')
    .isString()
    .withMessage('City must be a string'),

  check('postalCode')
    .notEmpty()
    .withMessage('Postal code is required')
    // .isPostalCode('any')
    // .withMessage('Invalid postal code'),
    .matches(/^\d{5}$/)
    .withMessage('Postal code must be a 5-digit number'),

  validatorMiddleware,
];

/**
 * @desc    Validate remove address request
 * @method  DELETE /api/v1/addresses/:addressId
 */
export const removeAddressValidator = [
  param('addressId')
    .notEmpty()
    .withMessage('Address ID is required')
    .isMongoId()
    .withMessage('Invalid address ID format'),

  validatorMiddleware,
];
