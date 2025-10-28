import express from 'express';
import {
  getCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../controllers/CouponController.js';
import { protect, allowedTo } from '../controllers/AuthController.js';
import {
  getCouponValidator,
  createCouponValidator,
  updateCouponValidator,
  deleteCouponValidator,
} from '../utils/validators/couponValidator.js';
const router = express.Router();

// Protect all routes and allow only admin & manager
router.use(protect, allowedTo('admin', 'manager'));

// CRUD Routes
router.route('/').get(getCoupons).post(createCouponValidator, createCoupon);

router
  .route('/:id')
  .get(getCouponValidator, getCoupon)
  .put(updateCouponValidator, updateCoupon)
  .delete(deleteCouponValidator, deleteCoupon);

export default router;
