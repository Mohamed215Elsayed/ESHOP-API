import { check, param } from 'express-validator';
import validatorMiddleware from '../../middlewares/validatorMiddleware.js';

const validateItemId = () => param('itemId').isMongoId().withMessage('Invalid Cart Item ID format');
/**
 * @desc    Validate adding product to cart
 * @method  POST /api/v1/cart
 */
export const addProductToCartValidator = [
  check('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid Product ID format'),

  check('color').optional().isString().withMessage('Color must be a string'),
  // .isHexColor()
  validatorMiddleware,
];

/**
 * @desc    Validate updating item quantity
 * @method  PUT /api/v1/cart/:itemId
 */
export const updateCartItemQuantityValidator = [
  validateItemId(),

  check('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),

  validatorMiddleware,
];

/**
 * @desc    Validate removing specific cart item
 * @method  DELETE /api/v1/cart/:itemId
 */
export const removeSpecificCartItemValidator = [validateItemId(), validatorMiddleware];

/**
 * @desc    Validate applying coupon to cart
 * @method  PUT /api/v1/cart/applyCoupon
 */
export const applyCouponValidator = [
  check('coupon')
    .notEmpty()
    .withMessage('Coupon name is required')
    .isString()
    .withMessage('Coupon name must be a string')
    .isLength({ min: 3 })
    .withMessage('Coupon name must be at least 3 characters'),

  validatorMiddleware,
];
