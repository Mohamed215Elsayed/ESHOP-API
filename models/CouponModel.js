import mongoose from 'mongoose';
import { Schema } from 'mongoose';
const couponSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Coupon name is required'],
      unique: true,
    },
    expire: {
      type: Date,
      required: [true, 'Coupon expiration date is required'],
    },
    discount: {
      type: Number,
      required: [true, 'Coupon discount value is required'],
      min: [0, 'Discount value cannot be negative'],
      max: [100, 'Discount value cannot exceed 100%'],
    },
  },
  { timestamps: true }
);

const CouponModel = mongoose.model('Coupon', couponSchema);
export default CouponModel;
