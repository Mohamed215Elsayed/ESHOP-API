import express from 'express';

import {
  createSubCategory,
  getSubCategory,
  getSubCategories,
  updateSubCategory,
  deleteSubCategory,
  setCategoryIdToBody,
  createFilterObj,
} from '../controllers/SubCategoryController.js';

import {
  createSubCategoryValidator,
  getSubCategoryValidator,
  updateSubCategoryValidator,
  deleteSubCategoryValidator,
} from '../utils/validators/subCategoryValidator.js';
import { protect, allowedTo } from '../controllers/AuthController.js';
// mergeParams: allow access to categoryId from parent router (Category)
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(
    protect,
    allowedTo('admin', 'manager'),
    setCategoryIdToBody,
    createSubCategoryValidator,
    createSubCategory
  )
  .get(createFilterObj, getSubCategories);

router
  .route('/:id')
  .get(getSubCategoryValidator, getSubCategory)
  .put(protect, allowedTo('admin', 'manager'), updateSubCategoryValidator, updateSubCategory)
  .delete(protect, allowedTo('admin'), deleteSubCategoryValidator, deleteSubCategory);

export default router;
