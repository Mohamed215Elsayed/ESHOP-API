import mongoose from 'mongoose';
const { Schema } = mongoose;
import ProductModel from './ProductModel.js';

const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: [200, 'Review title cannot exceed 200 characters'],
    },
    ratings: {
      type: Number,
      min: [1, 'Min ratings value is 1.0'],
      max: [5, 'Max ratings value is 5.0'],
      required: [true, 'Review rating is required'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
    product: {
      //parent reference (one to many)
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Review must belong to a product'],
    },
  },
  { timestamps: true }
);
/* ---🔹Auto Populate User Data (only name)---- */
reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name' });
  next();
});
reviewSchema.index({ product: 1, user: 1 }, { unique: true });
/* -----------------------------------------------------
   📊 Static Method: Calculate Average Ratings
----------------------------------------------------- */
reviewSchema.statics.calcAverageRatingsAndQuantity = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        avgRatings: { $avg: '$ratings' },
        ratingsQuantity: { $sum: 1 },
      },
    },
  ]);
  // console.log(stats);
  const updateData =
    stats.length > 0
      ? {
          ratingsAverage: stats[0].avgRatings,
          ratingsQuantity: stats[0].ratingsQuantity,
        }
      : { ratingsAverage: 0, ratingsQuantity: 0 };

  await ProductModel.findByIdAndUpdate(productId, updateData, { new: true });
};

/* -----------------------------------------------------
   🧠 Hooks: Recalculate ratings on save & delete
----------------------------------------------------- */
// After creating a new review
reviewSchema.post('save', function () {
  this.constructor.calcAverageRatingsAndQuantity(this.product);
});

// After updating an existing review (via findOneAndUpdate, findByIdAndUpdate)
reviewSchema.post('findOneAndUpdate', async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRatingsAndQuantity(doc.product);
  }
});

// After deleting a review
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRatingsAndQuantity(doc.product);
  }
});
/* -----------------------------------------------------
   🚀 Safe Export (prevents OverwriteModelError)
----------------------------------------------------- */
const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
export default Review;
