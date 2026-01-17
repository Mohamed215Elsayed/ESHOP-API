import slugify from 'slugify';
import { check, body } from 'express-validator';
import validatorMiddleware from '../../middlewares/validatorMiddleware.js';
import { mongoIdValidator } from './mongoIdValidator.js';
import CategoryModel from '../../models/CategoryModel.js';
import SubCategoryModel from '../../models/SubCategoryModel.js';
import ProductModel from '../../models/ProductModel.js';

/* ---------------- CREATE Product Validator ---------------- */
export const createProductValidator = [
  check('title')
    .notEmpty()
    .withMessage('Product title is required')
    .isLength({ min: 3 })
    .withMessage('Title must be at least 3 characters')
    .custom((val, { req }) => {
      req.body.slug = slugify(val, { lower: true });
      return true;
    }),

  check('description')
    .notEmpty()
    .withMessage('Product description is required')
    .isLength({ max: 2000 })
    .withMessage('Description too long (max 2000 chars)'),

  check('quantity')
    .notEmpty()
    .withMessage('Product quantity is required')
    .isNumeric()
    .withMessage('Quantity must be a number'),

  check('sold').optional().isNumeric().withMessage('Sold quantity must be a number'),

  check('price')
    .notEmpty()
    .withMessage('Product price is required')
    .isFloat({ gt: 0 })
    .withMessage('Price must be a positive number'),

  check('priceAfterDiscount')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Discount price must be a number')
    .custom((value, { req }) => {
      const price = parseFloat(req.body.price);
      if (!price) throw new Error('Price must exist before discount');
      if (value >= price) throw new Error('Discount price must be lower than the original price');
      return true;
    }),

  check('colors').optional().isArray().withMessage('Colors should be an array of strings'),

  check('imageCover').notEmpty().withMessage('Product image cover is required'),

  check('images').optional().isArray().withMessage('Images should be an array of strings'),

  check('category')
    .notEmpty()
    .withMessage('Product must belong to a category')
    .isMongoId()
    .withMessage('Invalid Category ID format')
    .bail()
    .custom(async (categoryId) => {
      const category = await CategoryModel.findById(categoryId);
      if (!category) throw new Error('Category not found');
      return true;
    }),

  check('subcategories')
    .optional()
    .isArray()
    .withMessage('Subcategories must be an array of IDs')
    .bail()
    .custom(async (subIds, { req }) => {
      if (!req.body.category) throw new Error('Category is required with subcategories');
      const subs = await SubCategoryModel.find({
        _id: { $in: subIds },
        category: req.body.category,
      });
      if (subs.length !== subIds.length)
        throw new Error('Some subcategories do not belong to this category');
      return true;
    }),

  check('brand').optional().isMongoId().withMessage('Invalid Brand ID format'),

  check('ratingsAverage')
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Ratings average must be between 1.0 and 5.0'),

  check('ratingsQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Ratings quantity must be a non-negative integer'),

  validatorMiddleware,
];

/* ---------------- UPDATE Product Validator ---------------- */
export const updateProductValidator = [
  mongoIdValidator('id', 'Product'),

  body('title')
    .optional()
    .isLength({ min: 3 })
    .withMessage('Title must be at least 3 characters')
    .custom((val, { req }) => {
      req.body.slug = slugify(val, { lower: true });
      return true;
    }),

  body('price').optional().isFloat({ gt: 0 }).withMessage('Price must be positive'),

  body('priceAfterDiscount')
    .optional()
    .custom(async (value, { req }) => {
      if (value != null) {
        const doc = await ProductModel.findById(req.params.id).select('price');
        const price = req.body.price || (doc ? doc.price : null);
        if (!price) throw new Error('Cannot set discount without price');
        if (value >= price) throw new Error('Discount price must be lower than the original price');
      }
      return true;
    }),

  body('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid Category ID')
    .bail()
    .custom(async (id) => {
      const category = await CategoryModel.findById(id);
      if (!category) throw new Error('Category not found');
      return true;
    }),

  body('subcategories')
    .optional()
    .isArray()
    .withMessage('Subcategories must be an array')
    .bail()
    .custom(async (ids, { req }) => {
      if (!req.body.category) return true;
      const subs = await SubCategoryModel.find({ _id: { $in: ids }, category: req.body.category });
      if (subs.length !== ids.length)
        throw new Error('Some subcategories do not belong to this category');
      return true;
    }),

  body('brand').optional().isMongoId().withMessage('Invalid Brand ID'),

  validatorMiddleware,
];

/* ---------------- GET & DELETE ---------------- */
export const getProductValidator = [mongoIdValidator('id', 'Product'), validatorMiddleware];
export const deleteProductValidator = [mongoIdValidator('id', 'Product'), validatorMiddleware];
