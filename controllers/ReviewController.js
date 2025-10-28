import * as factory from '../services/handlersFactory.js';
import Review from '../models/ReviewModel.js';

/* -----------------------------------------------------
   🔹 Middleware: Create Filter Object for Nested Routes
   e.g. GET /api/v1/products/:productId/reviews
----------------------------------------------------- */
// Nested route
// GET /api/v1/products/:productId/reviews
export const createFilterObj = (req, res, next) => {
  req.filterObj = req.params.productId ? { product: req.params.productId } : {};
  next();
};

/* -----------------------------------------------------
   🧩 Middleware: Auto-set product & user IDs before create
----------------------------------------------------- */
// Nested route (Create)
export const setProductIdAndUserIdToBody = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId; //same name such as productId in route
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

/* -----------------------------------------------------
   📖 CRUD Operations
----------------------------------------------------- */

// @desc    Get list of reviews
// @route   GET /api/v1/reviews
// @access  Public
export const getReviews = factory.getAll(Review);

// @desc    Get specific review by ID
// @route   GET /api/v1/reviews/:id
// @access  Public
export const getReview = factory.getOne(Review);

// @desc    Create a new review
// @route   POST /api/v1/reviews
// @access  Private/Protect (User)
export const createReview = factory.createOne(Review);

// @desc    Update specific review
// @route   PUT /api/v1/reviews/:id
// @access  Private/Protect (User)
export const updateReview = factory.updateOne(Review);

// @desc    Delete specific review
// @route   DELETE /api/v1/reviews/:id
// @access  Private/Protect (User/Admin/Manager)
export const deleteReview = factory.deleteOne(Review);
