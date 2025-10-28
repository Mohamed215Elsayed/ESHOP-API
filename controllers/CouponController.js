import * as factory from '../services/handlersFactory.js';
import CouponModel from '../models/CouponModel.js';

/**
 * @desc    Get list of coupons
 * @route   GET /api/v1/coupons
 * @access  Private/Admin-Manager
 */
export const getCoupons = factory.getAll(CouponModel);

/**
 * @desc    Get specific coupon by ID
 * @route   GET /api/v1/coupons/:id
 * @access  Private/Admin-Manager
 */
export const getCoupon = factory.getOne(CouponModel);

/**
 * @desc    Create a new coupon
 * @route   POST /api/v1/coupons
 * @access  Private/Admin-Manager
 */
export const createCoupon = factory.createOne(CouponModel);

/**
 * @desc    Update specific coupon
 * @route   PUT /api/v1/coupons/:id
 * @access  Private/Admin-Manager
 */
export const updateCoupon = factory.updateOne(CouponModel);

/**
 * @desc    Delete specific coupon
 * @route   DELETE /api/v1/coupons/:id
 * @access  Private/Admin-Manager
 */
export const deleteCoupon = factory.deleteOne(CouponModel);
