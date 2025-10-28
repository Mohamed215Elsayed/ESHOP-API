import { check, param } from 'express-validator';
import validatorMiddleware from '../../middlewares/validatorMiddleware.js';

// Common validation rules
// Makes the field optional in update (PUT) requests.
// Still allows .exists() in create validator to enforce required.
//.optional({ nullable: true }) // allows optional in update, but required in create
const validateCouponName = () =>
  check('name')
    .optional({ nullable: true }) // allows optional in update, but required in create
    .notEmpty()
    .withMessage('Coupon name is required')
    .isString()
    .withMessage('Coupon name must be a string')
    .isLength({ min: 3, max: 50 })
    .withMessage('Coupon name must be between 3 and 50 characters');

const validateExpireDate = () =>
  check('expire')
    .optional({ nullable: true })
    .notEmpty()
    .withMessage('Expiration date is required')
    .isISO8601()
    .withMessage('Expiration date must be a valid ISO date')
    .custom((value) => {
      const expireDate = new Date(value);
      if (expireDate <= new Date()) {
        throw new Error('Expiration date must be in the future');
      }
      return true;
    });

const validateDiscount = () =>
  check('discount')
    .optional({ nullable: true })
    .notEmpty()
    .withMessage('Discount value is required')
    .isNumeric()
    .withMessage('Discount must be a number')
    .custom((value) => value > 0 && value <= 100)
    .withMessage('Discount must be between 1 and 100');

const validateCouponId = () => param('id').isMongoId().withMessage('Invalid coupon ID format');

// ----------------------
// Validators
// ----------------------

/**
 * @desc  Validate create coupon request
 * @route POST /api/v1/coupons
 */
export const createCouponValidator = [
  validateCouponName().exists(), // now required
  validateExpireDate().exists(),
  validateDiscount().exists(),
  validatorMiddleware,
];

/**
 * @desc  Validate update coupon request
 * @route PUT /api/v1/coupons/:id
 */
export const updateCouponValidator = [
  validateCouponId(),
  validateCouponName(),
  validateExpireDate(),
  validateDiscount(),
  validatorMiddleware,
];

/**
 * @desc  Validate get coupon by ID
 * @route GET /api/v1/coupons/:id
 */
export const getCouponValidator = [validateCouponId(), validatorMiddleware];

/**
 * @desc  Validate delete coupon by ID
 * @route DELETE /api/v1/coupons/:id
 */
export const deleteCouponValidator = [validateCouponId(), validatorMiddleware];

// import { check, param } from 'express-validator';
// import validatorMiddleware from '../../middlewares/validatorMiddleware.js';

// /**
//  * @desc    Validate create coupon request
//  * @method  POST /api/v1/coupons
//  */
// export const createCouponValidator = [
//   check('name')
//     .notEmpty()
//     .withMessage('Coupon name is required')
//     .isString()
//     .withMessage('Coupon name must be a string')
//     .isLength({ min: 3, max: 50 })
//     .withMessage('Coupon name must be between 3 and 50 characters'),

//   check('expire')
//     .notEmpty()
//     .withMessage('Expiration date is required')
//     .isISO8601()
//     .withMessage('Expiration date must be a valid ISO date')
//     .custom((value) => {
//       const now = new Date();
//       const expireDate = new Date(value);
//       if (expireDate <= now) {
//         throw new Error('Expiration date must be in the future');
//       }
//       return true;
//     }),

//   check('discount')
//     .notEmpty()
//     .withMessage('Discount value is required')
//     .isNumeric()
//     .withMessage('Discount must be a number')
//     .custom((value) => value > 0 && value <= 100)
//     .withMessage('Discount must be between 1 and 100'),

//   validatorMiddleware,
// ];

// /**
//  * @desc    Validate update coupon request
//  * @method  PUT /api/v1/coupons/:id
//  */
// export const updateCouponValidator = [
//   param('id').isMongoId().withMessage('Invalid coupon ID format'),

//   check('name')
//     .optional()
//     .isString()
//     .withMessage('Coupon name must be a string')
//     .isLength({ min: 3, max: 50 })
//     .withMessage('Coupon name must be between 3 and 50 characters'),

//   check('expire')
//     .optional()
//     .isISO8601()
//     .withMessage('Expiration date must be a valid ISO date')
//     .custom((value) => {
//       const now = new Date();
//       const expireDate = new Date(value);
//       if (expireDate <= now) {
//         throw new Error('Expiration date must be in the future');
//       }
//       return true;
//     }),

//   check('discount')
//     .optional()
//     .isNumeric()
//     .withMessage('Discount must be a number')
//     .custom((value) => value > 0 && value <= 100)
//     .withMessage('Discount must be between 1 and 100'),

//   validatorMiddleware,
// ];

// /**
//  * @desc    Validate get specific coupon request
//  * @method  GET /api/v1/coupons/:id
//  */
// export const getCouponValidator = [
//   param('id').isMongoId().withMessage('Invalid coupon ID format'),
//   validatorMiddleware,
// ];

// /**
//  * @desc    Validate delete coupon request
//  * @method  DELETE /api/v1/coupons/:id
//  */
// export const deleteCouponValidator = [
//   param('id').isMongoId().withMessage('Invalid coupon ID format'),
//   validatorMiddleware,
// ];
