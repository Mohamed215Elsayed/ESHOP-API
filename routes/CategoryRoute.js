import express from 'express';
import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/CategoryControllers.js';
import {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
} from '../utils/validators/categoryValidator.js';
import SubCategoryRoute from './SubCategoryRoute.js';
import { uploadCategoryImage, resizeCategoryImage } from '../controllers/CategoryControllers.js';
import { protect, allowedTo } from '../controllers/AuthController.js';
const router = express.Router();
//link to subcategories route file(nested routes)
router.use('/:categoryId/subcategories', SubCategoryRoute);

/**
 * @route   /api/v1/categories
 * @desc    Get all categories OR create new category
 * @access  GET → Public, POST → Private(Admin, Manager)
 */
router
  .route('/')
  .get(getCategories)
  .post(
    protect,
    allowedTo('admin', 'manager'),
    uploadCategoryImage,
    resizeCategoryImage,
    createCategoryValidator,
    createCategory
  );

/**
 * @route   /api/v1/categories/:id
 * @desc    Get, Update, or Delete a specific category
 * @access  GET → Public, PUT/DELETE → Private(Admin)
 */
router
  .route('/:id')
  .get(getCategoryValidator, getCategory)
  .put(
    protect,
    allowedTo('admin', 'manager'),
    uploadCategoryImage,
    resizeCategoryImage,
    updateCategoryValidator,
    updateCategory
  )
  .delete(protect, allowedTo('admin'), deleteCategoryValidator, deleteCategory);

export default router;
