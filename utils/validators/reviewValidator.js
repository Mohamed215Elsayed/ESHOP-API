import { check } from 'express-validator';
import validatorMiddleware from '../../middlewares/validatorMiddleware.js';
import Review from '../../models/ReviewModel.js';
import { mongoIdValidator } from './mongoIdValidator.js';

/* ----------------------------------------------------
 📝 Create Review Validator
---------------------------------------------------- */
export const createReviewValidator = [
  check('title').optional(),

  check('ratings')
    .notEmpty()
    .withMessage('Ratings value is required')
    .isFloat({ min: 1, max: 5 })
    .withMessage('Ratings value must be between 1 and 5'),

  check('user').optional().isMongoId().withMessage('Invalid user ID format'),

  check('product')
    .isMongoId()
    .withMessage('Invalid product ID format')
    .custom(async (val, { req }) => {
      // ✅ Prevent duplicate review by the same user on the same product
      const existingReview = await Review.findOne({
        user: req.user._id,
        product: req.body.product,
      });

      if (existingReview) {
        throw new Error('You have already reviewed this product.');
      }
    }),

  validatorMiddleware,
];

/* ----------------------------------------------------
 🔍 Get Review Validator
---------------------------------------------------- */
export const getReviewValidator = [mongoIdValidator('id', 'Review'), validatorMiddleware];

/* ----------------------------------------------------
 ✏️ Update Review Validator
---------------------------------------------------- */
export const updateReviewValidator = [
  mongoIdValidator('id', 'Review'),

  check('id').custom(async (val, { req }) => {
    const review = await Review.findById(val);
    if (!review) throw new Error(`No review found with ID: ${val}`);

    // ✅ Only the review owner can update their review
    if (review.user._id.toString() !== req.user._id.toString()) {
      throw new Error('You are not authorized to update this review.');
    }
  }),

  validatorMiddleware,
];

/* ----------------------------------------------------
 🗑️ Delete Review Validator
---------------------------------------------------- */
export const deleteReviewValidator = [
  mongoIdValidator('id', 'Review'),

  check('id').custom(async (val, { req }) => {
    // ✅ Admins/managers can delete any review
    if (req.user.role === 'user') {
      const review = await Review.findById(val);
      if (!review) throw new Error(`No review found with ID: ${val}`);

      //   if (review.user._id.toString() !== req.user._id.toString()) {
      //     throw new Error('You are not authorized to delete this review.');
      //   }
      if (!review.user.equals(req.user._id)) {
        throw new Error('You are not authorized to modify this review.');
      }
    }
  }),

  validatorMiddleware,
];
