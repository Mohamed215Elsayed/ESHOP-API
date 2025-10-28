import mongoose from 'mongoose';
import slugify from 'slugify';
const { Schema } = mongoose;
// import { addImageUrlHook } from '../middlewares/responseModelMiddleware.js';
import addImageUrlHook from '../middlewares/responseModelMiddleware.js';
const brandSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Brand name is required'],
      unique: [true, 'Brand name must be unique'],
      trim: true,
      minlength: [2, 'Too short brand name'],
      maxlength: [32, 'Too long brand name'],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    // toJSON: { virtuals: true }, // Enables virtuals in JSON output
    // toObject: { virtuals: true }, // Enables virtuals in objects
  }
);

// 🌀 2. Pre-save middleware: generate slug from name
brandSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

// 🌀 3. Pre-update middleware: regenerate slug if name is updated
brandSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update?.name) {
    update.slug = slugify(update.name, { lower: true });
    this.setUpdate(update);
  }
  next();
});
brandSchema.index({ name: 'text' });
// addImageUrlHook(brandSchema, 'brands');
addImageUrlHook(brandSchema, 'brands', 'image');
// 🧱 4. Create & export model
const BrandModel = mongoose.model('Brand', brandSchema);
export default BrandModel;
