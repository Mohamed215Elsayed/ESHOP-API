import mongoose from 'mongoose';
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
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Review must belong to a product'],
    },
  },
  { timestamps: true }
);

/* 🔹 Auto Populate User */
reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name' });
  next();
});

/* 🔹 Prevent duplicate reviews */
reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ product: 1, ratings: -1 });

/* 🔹 Calculate Avg Ratings */
reviewSchema.statics.calcAverageRatingsAndQuantity = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$ratings' },
        ratingsQuantity: { $sum: 1 },
      },
    },
  ]);

  await ProductModel.findByIdAndUpdate(productId, {
    ratingsAverage: stats.length ? stats[0].avgRating : 0,
    ratingsQuantity: stats.length ? stats[0].ratingsQuantity : 0,
  });
};

/* 🔹 Hooks */
reviewSchema.post('save', function () {
  this.constructor.calcAverageRatingsAndQuantity(this.product);
});

reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRatingsAndQuantity(doc.product);
  }
});

// reviewSchema.post('findOneAndUpdate', async function () {
//   const doc = await this.model.findOne(this.getQuery());
//   if (doc) {
//     await doc.constructor.calcAverageRatingsAndQuantity(doc.product);
//   }
// });
reviewSchema.post('findOneAndUpdate', async function (doc) {
  if (doc) {
    // doc هو الوثيقة التي تم تعديلها بالفعل
    await doc.constructor.calcAverageRatingsAndQuantity(doc.product);
  }
});
/* 🔹 Safe Export */
const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
export default Review;
