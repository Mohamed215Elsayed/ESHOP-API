import express from 'express';
import {
  getProductValidator,
  createProductValidator,
  updateProductValidator,
  deleteProductValidator,
} from '../utils/validators/productValidator.js';

import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/ProductController.js';
import { uploadProductImage, resizeProductImage } from '../controllers/ProductController.js';
import { protect, allowedTo } from '../controllers/AuthController.js';
import ReviewRoute from './ReviewRoute.js';
const router = express.Router();
//for nested routes
// POST   /products/jkshjhsdjh2332n/reviews
// GET    /products/jkshjhsdjh2332n/reviews
// GET    /products/jkshjhsdjh2332n/reviews/87487sfww3
router.use('/:productId/reviews', ReviewRoute);
/* -------------------------------------------------------------------------- */
/* 🧩 Products Routes
/* -------------------------------------------------------------------------- */

// /api/v1/products
router
  .route('/')
  .get(getProducts) // ✅ Public — supports filtering, pagination, search, etc.
  .post(
    protect,
    allowedTo('admin', 'manager'),
    uploadProductImage,
    resizeProductImage,
    createProductValidator,
    createProduct
  ); // 🔒 Admin — with validation

// /api/v1/products/:id
router
  .route('/:id')
  .get(getProductValidator, getProduct) // ✅ Public — single product
  .put(
    protect,
    allowedTo('admin', 'manager'),
    uploadProductImage,
    resizeProductImage,
    updateProductValidator,
    updateProduct
  ) // 🔒 Admin — update product
  .delete(protect, allowedTo('admin'), deleteProductValidator, deleteProduct); // 🔒 Admin — delete product

export default router;
