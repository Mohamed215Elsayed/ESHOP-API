import mongoose from 'mongoose';
import slugify from 'slugify';

const { Schema } = mongoose;

const subCategorySchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: [true, 'SubCategory name must be unique'],
      minlength: [2, 'Too short SubCategory name'],
      maxlength: [32, 'Too long SubCategory name'],
      required: [true, 'SubCategory name is required'],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'SubCategory must belong to a parent category'],
    },
  },
  { timestamps: true }
);

/**
 * 🧠 Auto-generate slug from name
 */
subCategorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

subCategorySchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.name) {
    update.slug = slugify(update.name, { lower: true });
    this.setUpdate(update);
  }
  next();
});

/**
 * ⚡ Indexing for better query performance
 */
subCategorySchema.index({ name: 1, category: 1 }, { unique: true });
subCategorySchema.index({ name: 'text' });
subCategorySchema.index({ category: 1 });

/**
 * 🚀 Auto-populate parent category details
 */
subCategorySchema.pre(/^find/, function (next) {
  this.populate({ path: 'category', select: 'name -_id' });
  next();
});

const SubCategoryModel = mongoose.model('SubCategory', subCategorySchema);
export default SubCategoryModel;
