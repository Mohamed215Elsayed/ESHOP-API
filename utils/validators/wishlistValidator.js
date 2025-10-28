// utils/validators/wishlistValidator.js
import { check, param } from 'express-validator';
import validatorMiddleware from '../../middlewares/validatorMiddleware.js';
import ProductModel from '../../models/ProductModel.js';

/**
 * @desc    Validate add to wishlist request
 * @method  POST /api/v1/wishlist
 */
export const addProductToWishlistValidator = [
  check('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .bail()
    .isMongoId()
    .withMessage('Invalid product ID format')
    .bail()
    .custom(async (productId) => {
      const product = await ProductModel.findById(productId);
      if (!product) {
        throw new Error('No product found with this ID');
      }
      return true;
    }),

  validatorMiddleware,
];

/**
 * @desc    Validate remove from wishlist request
 * @method  DELETE /api/v1/wishlist/:productId
 */
export const removeProductFromWishlistValidator = [
  param('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .bail()
    .isMongoId()
    .withMessage('Invalid product ID format'),

  validatorMiddleware,
];
