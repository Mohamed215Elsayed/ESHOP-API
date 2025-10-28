import SubCategoryModel from '../models/SubCategoryModel.js';
import * as factory from '../services/handlersFactory.js';

export const getSubCategories = factory.getAll(SubCategoryModel, 'SubCategory');
export const getSubCategory = factory.getOne(SubCategoryModel, {
  path: 'category',
  select: 'name -_id',
});
export const createSubCategory = factory.createOne(SubCategoryModel);
export const updateSubCategory = factory.updateOne(SubCategoryModel);
export const deleteSubCategory = factory.deleteOne(SubCategoryModel);
/* ------------------------------------------------------------- */
/* -------------------------------------------------------------
   🧩 Middleware: Set categoryId to body (for nested routes)
   Example: POST /api/v1/categories/:categoryId/subcategories
--------------------------هستحدم دا فس الانشاء---- */
export const setCategoryIdToBody = (req, res, next) => {
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

/* -------------------------------------------------------------
   🧩 Middleware: Create filter object for nested route
   Example: GET /api/v1/categories/:categoryId/subcategories
   -لاني معنديش اوبجكت اصلا فكريته ثم ارجع بناءا عليه هنا هنفلتر وهنرجع بناءا عليها- */
export const createFilterObj = (req, res, next) => {
  const filterObject = req.params.categoryId ? { category: req.params.categoryId } : {};
  req.filterObj = filterObject;
  next();
};
/* ------------------------------------------------------------- */
// import slugify from 'slugify';
// import asyncHandler from 'express-async-handler';
// import ApiError from '../utils/apiError.js';
// import ApiFeatures from '../utils/apiFeatures.js';
/* -------------------------------------------------------------
   @desc    Get list of subcategories (with filtering + pagination)
   @route   GET /api/v1/subcategories
   @access  Public
------------------------------------------------------------- */
// export const getSubCategories = asyncHandler(async (req, res) => {
//   const mongooseQuery = SubCategoryModel.find(req.filterObj || {}).populate({
//     path: 'category',
//     select: 'name -_id',
//   });
//   const totalDocuments = await SubCategoryModel.countDocuments(req.filterObj || {});

//   const apiFeatures = new ApiFeatures(mongooseQuery, req.query)
//     .filter()
//     .search('SubCategory')
//     .sort()
//     .limitFields()
//     .paginate(totalDocuments);

//   const subCategories = await apiFeatures.mongooseQuery;

//   res.status(200).json({
//     status: 'success',
//     results: subCategories.length,
//     pagination: apiFeatures.paginationResult,
//     data: subCategories,
//   });
// });
/*--------------------------------------------------------------------------- */
// export const getSubCategories = asyncHandler(async (req, res) => {
//   const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
//   const limit = Math.max(parseInt(req.query.limit, 10) || 5, 1);
//   const skip = (page - 1) * limit;

//   const [subCategories, total] = await Promise.all([
//     SubCategoryModel.find(req.filterObj || {}) // { category: req.params.categoryId }
//       .skip(skip)
//       .limit(limit)
//       .populate({ path: 'category', select: 'name -_id' })
//       .lean(),
//     SubCategoryModel.countDocuments(req.filterObj || {}),
//   ]);
//   //   console.log(req.params.categoryId); // { category: req.params.categoryId }
//   res.status(200).json({
//     status: 'success',
//     results: subCategories.length,
//     total,
//     page,
//     pages: Math.ceil(total / limit),
//     message: 'Subcategories fetched successfully',
//     data: subCategories,
//   });
// });

/* -------------------------------------------------------------
   @desc    Create a new SubCategory
   @route   POST /api/v1/subcategories
   @access  Private (Admin)
------------------------------------------------------------- */
// export const createSubCategory = asyncHandler(async (req, res, next) => {
//   //   if (!req.body.name?.trim() || !req.body.category) req.body.category = req.params.categoryId;//second way
//   const { name, category } = req.body;

//   if (!name?.trim() || !category) {
//     return next(new ApiError('SubCategory name and parent category are required', 400));
//   }

//   const slug = slugify(name, { lower: true, strict: true });

//   //Prevent duplicate subcategory name in same category
//   const existing = await SubCategoryModel.findOne({ slug, category });
//   if (existing) {
//     return next(new ApiError('SubCategory already exists in this category', 400));
//   }

//   const subCategory = await SubCategoryModel.create({ name, slug, category });

//   res.status(201).json({
//     status: 'success',
//     message: 'SubCategory created successfully',
//     data: subCategory,
//   });
// });

/* -------------------------------------------------------------
   @desc    Get a specific SubCategory by ID
   @route   GET /api/v1/subcategories/:id
   @access  Public
------------------------------------------------------------- */
// export const getSubCategory = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   const subCategory = await SubCategoryModel.findById(id);
//   //   .populate({
//   //     path: 'category',
//   //     select: 'name -_id',
//   //   });

//   if (!subCategory) {
//     return next(new ApiError(`No SubCategory found with ID: ${id}`, 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: subCategory,
//   });
// });

/* -------------------------------------------------------------
   @desc    Update a specific SubCategory
   @route   PUT /api/v1/subcategories/:id
   @access  Private (Admin)
------------------------------------------------------------- */
// export const updateSubCategory = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   const { name, category } = req.body;

//   if (!name?.trim()) {
//     return next(new ApiError('SubCategory name is required', 400));
//   }

//   const slug = slugify(name, { lower: true, strict: true });

//   const subCategory = await SubCategoryModel.findByIdAndUpdate(
//     id,
//     { name, slug, category },
//     { new: true, runValidators: true }
//   );

//   if (!subCategory) {
//     return next(new ApiError(`No SubCategory found with ID: ${id}`, 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     message: 'SubCategory updated successfully',
//     data: subCategory,
//   });
// });

/* -------------------------------------------------------------
   @desc    Delete a specific SubCategory
   @route   DELETE /api/v1/subcategories/:id
   @access  Private (Admin)
------------------------------------------------------------- */
// export const deleteSubCategory = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   const subCategory = await SubCategoryModel.findByIdAndDelete(id);
// export const deleteSubCategory = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   const subCategory = await SubCategoryModel.findByIdAndDelete(id);

//   if (!subCategory) {
//     return next(new ApiError(`No SubCategory found with ID: ${id}`, 404));
//   }

//   res.status(204).json({
//     status: 'success',
//     message: 'SubCategory deleted successfully',
//   });
// });
