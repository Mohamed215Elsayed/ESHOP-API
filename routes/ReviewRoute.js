import express from 'express';
import {
  createReviewValidator,
  updateReviewValidator,
  getReviewValidator,
  deleteReviewValidator,
} from '../utils/validators/reviewValidator.js';

import {
  getReview,
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  createFilterObj,
  setProductIdAndUserIdToBody,
} from '../controllers/ReviewController.js';
import { protect, allowedTo } from '../controllers/AuthController.js';

const router = express.Router({ mergeParams: true });

/* -----------------------------------------------------
   🧩 Nested Route Example:
   GET /api/v1/products/:productId/reviews
----------------------------------------------------- */
router
  .route('/')
  .get(createFilterObj, getReviews)
  .post(
    protect,
    allowedTo('user'),
    setProductIdAndUserIdToBody,
    createReviewValidator,
    createReview
  );

/* -----------------------------------------------------
   🔹 Review by ID
----------------------------------------------------- */
router
  .route('/:id')
  .get(getReviewValidator, getReview)
  .put(protect, allowedTo('user'), updateReviewValidator, updateReview)
  .delete(protect, allowedTo('user', 'manager', 'admin'), deleteReviewValidator, deleteReview);

export default router;
