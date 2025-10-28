import express from 'express';

import {
  getBrandValidator,
  createBrandValidator,
  updateBrandValidator,
  deleteBrandValidator,
} from '../utils/validators/brandValidator.js';

import {
  getBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
} from '../controllers/BrandController.js';
import { uploadBrandImage, resizeBrandImage } from '../controllers/BrandController.js';
import { protect, allowedTo } from '../controllers/AuthController.js';
const router = express.Router();

router
  .route('/')
  .get(getBrands)
  .post(
    protect,
    allowedTo('admin', 'manager'),
    uploadBrandImage,
    resizeBrandImage,
    createBrandValidator,
    createBrand
  );

router
  .route('/:id')
  .get(getBrandValidator, getBrand)
  .put(
    protect,
    allowedTo('admin', 'manager'),
    uploadBrandImage,
    resizeBrandImage,
    updateBrandValidator,
    updateBrand
  )
  .delete(protect, allowedTo('admin'), deleteBrandValidator, deleteBrand);

export default router;
