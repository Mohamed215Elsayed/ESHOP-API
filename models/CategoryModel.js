import mongoose from 'mongoose';
import slugify from 'slugify';
import SubCategoryModel from './SubCategoryModel.js';
const { Schema } = mongoose;
// import { addImageUrlHook } from '../middlewares/responseModelMiddleware.js';
import addImageUrlHook from '../middlewares/responseModelMiddleware.js';
const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      minlength: [3, 'Category name must be at least 3 characters long'],
      maxlength: [32, 'Category name must not exceed 32 characters'],
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true,
    },
    image: {
      type: String, // e.g. URL or filename
      default: 'default-category.jpg',
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// ✅ Case-insensitive unique index on 'name'
categorySchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

// ✅ Normalize and generate slug before saving
categorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.name = this.name.trim();
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// ✅ Automatically include virtuals and hide internal fields
categorySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret.id;
    delete ret.createdAt;
    delete ret.updatedAt;
    return ret;
  },
});

// 🔹 Virtual populate (auto-load subcategories when needed)
categorySchema.virtual('subCategories', {
  ref: 'SubCategory', // The model to link
  foreignField: 'category', // Field in SubCategoryModel
  localField: '_id', // Field in CategoryModel
});

// 🔹 Cascade delete subcategories when category is deleted
categorySchema.pre('findOneAndDelete', async function (next) {
  const category = await this.model.findOne(this.getFilter());
  if (category) {
    await SubCategoryModel.deleteMany({ category: category._id });
  }
  next();
});
categorySchema.index({ name: 'text' });
// const setImageUrl = (doc) => {
//   if (doc.image) {
//     doc.image = `${process.env.BASE_URL}/uploads/categories/${doc.image}`;
//   }
// };
// categorySchema.post(['init', 'save'], function (doc) {
//   setImageUrl(doc);
// });
// addImageUrlHook(categorySchema, 'categories');
addImageUrlHook(categorySchema, 'categories', 'image');
const CategoryModel = mongoose.model('Category', categorySchema);
export default CategoryModel;
