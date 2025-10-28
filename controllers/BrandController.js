import BrandModel from '../models/BrandModel.js';
import * as factory from '../services/handlersFactory.js';
/* -------------------------------------------------------------------------- */
import { createImageProcessor } from '../middlewares/imageHandler.js';

const { upload, resize } = createImageProcessor({
  folder: 'brands',
  prefix: 'brand',
  fieldName: 'image',
});

export const uploadBrandImage = upload;
export const resizeBrandImage = resize;
/* -------------------------------------------------------------------------- */
export const getBrands = factory.getAll(BrandModel, 'Brand');
export const getBrand = factory.getOne(BrandModel);
export const createBrand = factory.createOne(BrandModel);
export const updateBrand = factory.updateOne(BrandModel);
export const deleteBrand = factory.deleteOne(BrandModel);

/* -------------------------------------------------------------------------- */
// import slugify from 'slugify';
// import asyncHandler from 'express-async-handler';
// import ApiError from '../utils/apiError.js';
// import ApiFeatures from '../utils/apiFeatures.js';
/**
 * @desc    Get all brands (with pagination)
 * @route   GET /api/v1/brands
 * @access  Public
 */
// export const getBrands = asyncHandler(async (req, res) => {
//   const mongooseQuery = BrandModel.find();
//   const totalDocuments = await BrandModel.countDocuments();
//   const apiFeatures = new ApiFeatures(mongooseQuery, req.query)
//     .filter()
//     .search('Brand')
//     .sort()
//     .limitFields()
//     .paginate(totalDocuments);

//   const brands = await apiFeatures.mongooseQuery;

//   res.status(200).json({
//     status: 'success',
//     results: brands.length,
//     pagination: apiFeatures.paginationResult,
//     data: brands,
//   });
// });
/*--------------------------------------------------------------------------- */
// export const getBrands = asyncHandler(async (req, res) => {
//   const page = parseInt(req.query.page, 10) || 1;
//   const limit = parseInt(req.query.limit, 10) || 5;
//   const skip = (page - 1) * limit;

//   const brands = await BrandModel.find({}).skip(skip).limit(limit);
//   const total = await BrandModel.countDocuments();

//   res.status(200).json({
//     status: 'success',
//     message: 'Brands fetched successfully',
//     results: brands.length,
//     page,
//     pages: Math.ceil(total / limit),
//     data: brands,
//   });
// });

/**
 * @desc    Get a specific brand by ID
 * @route   GET /api/v1/brands/:id
 * @access  Public
 */
// export const getBrand = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   const brand = await BrandModel.findById(id);

//   if (!brand) {
//     return next(new ApiError(`No brand found with ID: ${id}`, 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: brand,
//   });
// });

/**
 * @desc    Create a new brand
 * @route   POST /api/v1/brands
 * @access  Private
 */
// export const createBrand = asyncHandler(async (req, res, next) => {
//   const { name } = req.body;

//   if (!name?.trim()) {
//     return next(new ApiError('Brand name is required', 400));
//   }

//   const existing = await BrandModel.findOne({ name: new RegExp(`^${name}$`, 'i') });
//   if (existing) {
//     return next(new ApiError('Brand already exists', 400));
//   }

//   const brand = await BrandModel.create({
//     name: name.trim(),
//     slug: slugify(name, { lower: true, strict: true }),
//   });

//   res.status(201).json({
//     status: 'success',
//     message: 'Brand created successfully',
//     data: brand,
//   });
// });

/**
 * @desc    Update a specific brand
 * @route   PUT /api/v1/brands/:id
 * @access  Private
 */

/* -------------------------------------------------------------------------- */
// export const updateBrand = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   const { name } = req.body;

//   if (!name?.trim()) {
//     return next(new ApiError('Brand name is required', 400));
//   }
//   const slug = slugify(name, { lower: true, strict: true });
//   const brand = await BrandModel.findByIdAndUpdate(
//     id,
//     { name, slug },
//     { new: true, runValidators: true }
//   );

//   if (!brand) {
//     return next(new ApiError(`No brand found with ID: ${id}`, 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     message: 'Brand updated successfully',
//     data: brand,
//   });
// });

/**
 * @desc    Delete a specific brand
 * @route   DELETE /api/v1/brands/:id
 * @access  Private (Admin)
 */

/* -------------------------------------------------------------------------- */
// export const deleteBrand = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   const brand = await BrandModel.findByIdAndDelete(id);

//   if (!brand) {
//     return next(new ApiError(`No brand found with ID: ${id}`, 404));
//   }

//   res.status(204).json({
//     status: 'success',
//     message: 'Brand deleted successfully',
//   });
// });
