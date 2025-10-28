import CategoryModel from '../models/CategoryModel.js';
import * as factory from '../services/handlersFactory.js';
/* --------------------------------------------------------------------- */
import { createImageProcessor } from '../middlewares/imageHandler.js';

const { upload, resize } = createImageProcessor({
  folder: 'categories',
  prefix: 'category',
  fieldName: 'image',
});

export const uploadCategoryImage = upload;
export const resizeCategoryImage = resize;

/* -----------------------------------------------------------------------*/
export const getCategories = factory.getAll(CategoryModel, 'Category');
export const getCategory = factory.getOne(CategoryModel);
export const createCategory = factory.createOne(CategoryModel);
export const updateCategory = factory.updateOne(CategoryModel);
export const deleteCategory = factory.deleteOne(CategoryModel);
/* -------------------------------------------------------------------------- */
// import slugify from 'slugify';
// import asyncHandler from 'express-async-handler';
// import ApiError from '../utils/apiError.js';
// import ApiFeatures from '../utils/apiFeatures.js';
/* -------------------------------------------------------------
   @desc    Get all categories (with search, filter, sort, pagination)
   @route   GET /api/v1/categories
   @access  Public
------------------------------------------------------------- */
// export const getCategories = asyncHandler(async (req, res) => {
//   const mongooseQuery = CategoryModel.find(); //.populate('subCategories');
//   const totalDocuments = await CategoryModel.countDocuments();
//   const apiFeatures = new ApiFeatures(mongooseQuery, req.query)
//     .filter()
//     .search('Category')
//     .sort()
//     .limitFields()
//     .paginate(totalDocuments);

//   const categories = await apiFeatures.mongooseQuery;
//   res.status(200).json({
//     status: 'success',
//     results: categories.length,
//     pagination: apiFeatures.paginationResult,
//     data: categories,
//   });
// });
/*--------------------------------------------------------------------------- */
// export const getCategories = asyncHandler(async (req, res) => {
//   const page = Math.max(parseInt(req.query.page) || 1, 1);
//   const limit = Math.max(parseInt(req.query.limit) || 3, 1);
//   const skip = (page - 1) * limit;

//   // 🧠 Search by name
//   const search = req.query.search ? { name: { $regex: req.query.search, $options: 'i' } } : {};

//   // 🧮 Filtering (by createdAt range or other query fields)
//   const filter = {};
//   if (req.query.from || req.query.to) {
//     filter.createdAt = {};
//     if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
//     if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
//   }

//   // 🧭 Sorting (default = newest first)
//   // Example: ?sort=name  or ?sort=-createdAt
//   const sortBy = req.query.sort ? req.query.sort.replace(',', ' ') : '-createdAt';

//   // 🧾 Query Execution (parallel for performance)
//   const [categories, total] = await Promise.all([
//     CategoryModel.find({ ...search, ...filter })
//       .sort(sortBy)
//       .skip(skip)
//       .limit(limit)
//       .lean()
//       .populate('subCategories'),
//     CategoryModel.countDocuments({ ...search, ...filter }),
//   ]);

//   res.status(200).json({
//     status: 'success',
//     results: categories.length,
//     total,
//     page,
//     pages: Math.ceil(total / limit),
//     sort: sortBy,
//     data: categories,
//   });
// });

/* -------------------------------------------------------------
   @desc    Create new category
   @route   POST /api/v1/categories
   @access  Private (Admin)
------------------------------------------------------------- */
// export const createCategory = asyncHandler(async (req, res, next) => {
//   const { name } = req.body;
//   if (!name?.trim()) {
//     return next(new ApiError('Category name is required', 400));
//   }

//   const slug = slugify(name, { lower: true, strict: true });

//   // Avoid duplicate slugs
//   const existing = await CategoryModel.findOne({ slug });
//   if (existing) {
//     return next(new ApiError('Category already exists', 400));
//   }

//   const newCategory = await CategoryModel.create({ name, slug });

//   res.status(201).json({
//     status: 'success',
//     message: 'Category created successfully',
//     data: newCategory,
//   });
// });

/* -------------------------------------------------------------
   @desc    Get a single category by ID
   @route   GET /api/v1/categories/:id
   @access  Public
------------------------------------------------------------- */
// export const getCategory = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const category = await CategoryModel.findById(id);

//   if (!category) {
//     return next(new ApiError(`No category found with ID: ${id}`, 404));
//   }

//   res.status(200).json({ status: 'success', data: category });
// });

/* -------------------------------------------------------------
   @desc    Update a category
   @route   PUT /api/v1/categories/:id
   @access  Private (Admin)
------------------------------------------------------------- */
// export const updateCategory = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   const { name } = req.body;

//   if (!name?.trim()) {
//     return next(new ApiError('Category name is required', 400));
//   }

//   const slug = slugify(name, { lower: true, strict: true }); //{ strict: true }👉 Removes special characters like @, #, &, ', etc.

//   const category = await CategoryModel.findByIdAndUpdate(
//     id,
//     { name, slug },
//     { new: true, runValidators: true }
//   );

//   if (!category) {
//     // return res.status(404).json({
//     //   status: "fail",
//     //   message: `No category found with ID: ${id}`,
//     // });
//     return next(new ApiError(`No category found with ID: ${id}`, 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     message: 'Category updated successfully',
//     data: category,
//   });
// });

/* -------------------------------------------------------------
   @desc    Delete a category
   @route   DELETE /api/v1/categories/:id
   @access  Private (Admin)
------------------------------------------------------------- */

/*----------------------------------------------------------- */
// export const deleteCategory = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   const category = await CategoryModel.findByIdAndDelete(id);

//   if (!category) {
//     return next(new ApiError(`No category found with ID: ${id}`, 404));
//   }

//   res.status(204).json({
//     status: 'success',
//     message: 'Category deleted successfully',
//   });
// });
