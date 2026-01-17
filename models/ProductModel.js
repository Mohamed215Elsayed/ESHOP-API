import mongoose from 'mongoose';
import addImageUrlHook from '../middlewares/responseModelMiddleware.js';

const { Schema, model } = mongoose;

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
      min: [0, 'Price cannot be negative'],
      max: [200000, 'Too long product price'],
    },
    priceAfterDiscount: {
      type: Number,
      min: [0, 'Price cannot be negative'],
      validate: {
        validator: function (value) {
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
      required: function () {
        return this.isNew; // required عند الـ create فقط
      },
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product must belong to a category'],
      index: true,
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
      index: true,
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be above or equal 1.0'],
      max: [5, 'Rating must be below or equal 5.0'],
      set: (val) => Math.round(val * 10) / 10, // round to 1 decimal
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ---------------- Pre Save Hook ---------------- */
productSchema.pre('save', function (next) {
  if (this.priceAfterDiscount != null && this.priceAfterDiscount >= this.price) {
    return next(new Error('Discount price must be below original price'));
  }
  next();
});

/* ---------------- Pre FindOneAndUpdate Hook ---------------- */
productSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();

  if (update.priceAfterDiscount != null) {
    const doc = await this.model.findOne(this.getQuery()).select('price');
    if (doc && update.priceAfterDiscount >= doc.price) {
      return next(new Error('Discount price must be below original price'));
    }
  }
  next();
});

/* ---------------- Pre Query Hook ---------------- */
productSchema.pre(/^find/, function (next) {
  if (!this.getOptions().skipPopulate) {
    this.populate({ path: 'category', select: 'name' }).populate({
      path: 'brand',
      select: 'name',
    });
  }
  next();
});

/* ---------------- Virtuals ---------------- */
productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id',
});

/* ---------------- Indexes ---------------- */
productSchema.index({ title: 'text', description: 'text' });
productSchema.index({ price: 1, ratingsAverage: -1 });

/* ---------------- Image URL Middleware ---------------- */
addImageUrlHook(productSchema, 'products', ['imageCover', 'images']);

/* ---------------- Model ---------------- */
const ProductModel = model('Product', productSchema);
export default ProductModel;
