import mongoose from 'mongoose';

const { Schema, model } = mongoose;
// import { addImagesUrlHook, addImageCoverUrlHook } from '../middlewares/responseModelMiddleware.js';
import addImageUrlHook from '../middlewares/responseModelMiddleware.js';
const productSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      minlength: [3, 'Too short product title'],
      maxlength: [100, 'Too long product title'],
    },
    slug: {
      type: String,
      required: [true, 'Product slug is required'],
      lowercase: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      minlength: [20, 'Too short product description'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Product quantity is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    sold: {
      type: Number,
      default: 0,
      min: [0, 'Sold quantity cannot be negative'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      trim: true,
      max: [200000, 'Too long product price'],
    },
    priceAfterDiscount: {
      type: Number,
      validate: {
        validator: function (value) {
          // Only validate if both prices exist
          if (this.price && value != null) {
            return value < this.price;
          }
          return true;
        },
        message: 'Discount price must be below original price',
      },
    },

    colors: {
      type: [String],
      default: [],
    },
    imageCover: {
      type: String,
      required: [true, 'Product image cover is required'],
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product must belong to a category'],
    },
    subcategories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'SubCategory',
      },
    ],
    brand: {
      type: Schema.Types.ObjectId,
      ref: 'Brand',
    },
    ratingsAverage: {
      type: Number,
      min: [1, 'Rating must be above or equal 1.0'],
      max: [5, 'Rating must be below or equal 5.0'],
      set: (val) => Math.round(val * 10) / 10, // round to 1 decimal place
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    //to enable virtuals
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* -------------------------------------------------------------
   🔄 Pre Query Middleware
   Auto-populate Category & Brand fields on any find query
------------------------------------------------------------- */
productSchema.pre(/^find/, function (next) {
  this.populate({ path: 'category', select: 'name -_id' }).populate({
    path: 'brand',
    select: 'name -_id',
  });
  next();
});

/* -------------------------------------------------------------
   💡 Virtual Fields to link reviews to products
------------------------------------------------------------- */
productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id',
});

/* -------------------------------------------------------------
   🧮 Indexes
   Improves search & query performance
------------------------------------------------------------- */
productSchema.index({ title: 'text', description: 'text' });
productSchema.index({ price: 1, ratingsAverage: -1 });
// addImageCoverUrlHook(productSchema, 'products');
// addImagesUrlHook(productSchema, 'products');
addImageUrlHook(productSchema, 'products', ['imageCover', 'images']);
const ProductModel = model('Product', productSchema);

export default ProductModel;
