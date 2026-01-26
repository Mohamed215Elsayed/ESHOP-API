import ProductModel from '../models/ProductModel.js';
import * as factory from '../services/handlersFactory.js';
/* -------------------------------------------------------------------------- */
import { createImageProcessor } from '../middlewares/imageHandler.js';

const { upload: uploadProductImage, resize: resizeProductImage } = createImageProcessor({
  folder: 'products',
  prefix: 'prod',
  fields: [
    { name: 'imageCover', type: 'single', width: 1200, height: 1200 },
    { name: 'images', type: 'multiple', width: 1000, height: 1000, maxCount: 5 },
  ],
});
export { uploadProductImage, resizeProductImage };
/* -------------------------------------------------------------------------- */

// ✅ هنا نضيف populate ديناميكي للـ getOne و getAll
const populateOptions = [
  { path: 'reviews' }, // virtual populate
  { path: 'category', select: 'name' },
  { path: 'brand', select: 'name' },
  { path: 'subcategories', select: 'name' },
];

// 🟢 استخدام factory المحسّن
export const getProducts = factory.getAll(ProductModel, 'Product', populateOptions);
export const getProduct = factory.getOne(ProductModel, populateOptions);
export const createProduct = factory.createOne(ProductModel, populateOptions);
export const updateProduct = factory.updateOne(ProductModel);
export const deleteProduct = factory.deleteOne(ProductModel);

/* -------------------------------------------------------------------------- */
// import asyncHandler from 'express-async-handler';
// import slugify from 'slugify';
// import ApiError from '../utils/apiError.js';
// import ApiFeatures from '../utils/apiFeatures.js';
/* -------------------------------------------------------------------------- */
/* 🧩 @desc    Get list of products
/* 📍 @route   GET /api/v1/products
/* 🔒 @access  Public
/* -------------------------------------------------------------------------- */
// export const getProducts = asyncHandler(async (req, res) => {
//   const mongooseQuery = ProductModel.find()
//     .populate({ path: 'category', select: 'name -_id' })
//     .populate({ path: 'brand', select: 'name -_id' })
//     .populate({ path: 'subcategories', select: 'name -_id' });
//   const totalDocuments = await ProductModel.countDocuments();

//   const apiFeatures = new ApiFeatures(mongooseQuery, req.query)
//     .filter()
//     .search('Product')
//     .sort()
//     .limitFields()
//     .paginate(totalDocuments);

//   const products = await apiFeatures.mongooseQuery;

//   res.status(200).json({
//     status: 'success',
//     results: products.length,
//     pagination: apiFeatures.paginationResult,
//     data: products,
//   });
// });
/*--------------------------------------------------------------------------- */
// export const getProducts = asyncHandler(async (req, res) => {
//   // console.log(req.query);
//   /* --------------------------- 1️⃣ Clone query --------------------------- */
//   const queryObj = { ...req.query };
//   const excludeFields = ['page', 'sort', 'limit', 'fields', 'keyword'];
//   excludeFields.forEach((field) => delete queryObj[field]);
//   // console.log(queryObj);
//   /* --------------------------- 2️⃣ Advanced Filtering --------------------------- */
//   // Example: ?price[gte]=1000&price[lte]=3000
//   let queryStr = JSON.stringify(queryObj);
//   queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
//   const filters = JSON.parse(queryStr);
//   // console.log(filters);
//   /* --------------------------- 3️⃣ Text Search --------------------------- */
//   // Example: ?keyword=iphone
//   if (req.query.keyword) {
//     filters.$text = { $search: req.query.keyword };
//   }
//   // console.log(filters); //{ '$text': { '$search': 'iphone' } }
//   /* --------------------------- 4️⃣ Build Query --------------------------- */
//   let query = ProductModel.find(filters)
//     .populate({ path: 'category', select: 'name -_id' })
//     .populate({ path: 'brand', select: 'name -_id' })
//     .populate({ path: 'subcategories', select: 'name -_id' });
//   /* --------------------------- 5️⃣ Sorting --------------------------- */
//   // Example: ?sort=price,-ratingsAverage
//   if (req.query.sort) {
//     const sortBy = req.query.sort.split(',').join(' ');
//     query = query.sort(sortBy);
//   } else {
//     query = query.sort('-createdAt'); // Default: newest first
//   }
//   /* --------------------------- 6️⃣ Field Limiting --------------------------- */
//   // Example: ?fields=title,price,category
//   if (req.query.fields) {
//     const fields = req.query.fields.split(',').join(' ');
//     query = query.select(fields);
//   } else {
//     query = query.select('-__v');
//   }
//   /* --------------------------- 7️⃣ Pagination --------------------------- */
//   const page = parseInt(req.query.page, 10) || 1;
//   const limit = parseInt(req.query.limit, 10) || 10;
//   const skip = (page - 1) * limit;

//   query = query.skip(skip).limit(limit);

//   const totalDocs = await ProductModel.countDocuments(filters);
//   const totalPages = Math.ceil(totalDocs / limit);

//   /* --------------------------- 8️⃣ Execute Query --------------------------- */
//   const products = await query;
//   res.status(200).json({
//     status: 'success',
//     results: products.length,
//     pagination: {
//       currentPage: page,
//       totalPages,
//       limit,
//       totalDocs,
//       hasNextPage: page < totalPages,
//       hasPrevPage: page > 1,
//     },
//     data: products,
//   });
// });

/* -------------------------------------------------------------------------- */
/* 🧩 @desc    Create a new product
/* 📍 @route   POST /api/v1/products
/* 🔒 @access  Private (Admin)
/* -------------------------------------------------------------------------- */
// export const createProduct = asyncHandler(async (req, res) => {
//   const product = await ProductModel.create(req.body);
//   res.status(201).json({ status: 'success', data: product });
// });
/* -------------------------------------------------------------------------- */
/* 🧩 @desc    Get single product
/* 📍 @route   GET /api/v1/products/:id
/* 🔒 @access  Public
/* -------------------------------------------------------------------------- */
// export const getProduct = asyncHandler(async (req, res, next) => {
//   const product = await ProductModel.findById(req.params.id)
//     .populate({ path: 'category', select: 'name' })
//     .populate({ path: 'brand', select: 'name' })
//     .populate({ path: 'subcategories', select: 'name' });

//   if (!product) {
//     return next(new ApiError(`No product found for ID ${req.params.id}`, 404));
//   }

//   res.status(200).json({ status: 'success', data: product });
// });
// export const getProduct = factory.getOne(ProductModel);
//   , [
//   { path: 'category', select: 'name -_id' },
//   { path: 'brand', select: 'name -_id' },
//   { path: 'subcategories', select: 'name -_id' },
// ]);
/* -------------------------------------------------------------------------- */
/* 🧩 @desc    Update product
/* 📍 @route   PUT /api/v1/products/:id
/* 🔒 @access  Private (Admin)
/* -------------------------------------------------------------------------- */
// export const updateProduct = asyncHandler(async (req, res, next) => {
//   const product = await ProductModel.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });

//   if (!product) {
//     return next(new ApiError(`No product found for ID ${req.params.id}`, 404));
//   }

//   res.status(200).json({ status: 'success', data: product });
// });

/* -------------------------------------------------------------------------- */
/* 🧩 @desc    Delete product
/* 📍 @route   DELETE /api/v1/products/:id
/* 🔒 @access  Private (Admin)
/* -------------------------------------------------------------------------- */
// export const deleteProduct = asyncHandler(async (req, res, next) => {
//   const Id = req.params.id;
//   const product = await ProductModel.findByIdAndDelete(Id);

//   if (!product) {
//     return next(new ApiError(`No product found for ID ${req.params.id}`, 404));
//   }

//   res.status(204).json({ status: 'success', data: null });
// });
