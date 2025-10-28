import slugify from 'slugify';
import { check, body } from 'express-validator';
import validatorMiddleware from '../../middlewares/validatorMiddleware.js';
import { mongoIdValidator } from './mongoIdValidator.js';
import CategoryModel from '../../models/CategoryModel.js'; //
import SubCategoryModel from '../../models/SubCategoryModel.js'; //

/* -------------------------------------------------------------
   🧩 CREATE Product Validator
------------------------------------------------------------- */
export const createProductValidator = [
  check('title')
    .notEmpty()
    .withMessage('Product title is required')
    .isLength({ min: 3 })
    .withMessage('Title must be at least 3 characters')
    .custom((val, { req }) => {
      //custom validator to generate slug from title
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
    .withMessage('Price must be a positive number')
    .isLength({ max: 32 })
    .withMessage('Price is too large'),

  check('priceAfterDiscount')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Discount price must be a number')
    .custom((value, { req }) => {
      const price = parseFloat(req.body.price);
      const discount = parseFloat(value);

      if (isNaN(price) || isNaN(discount)) {
        throw new Error('Both price and discount must be valid numbers');
      }
      if (discount >= price) {
        throw new Error('Discount price must be lower than the original price');
      }
      return true;
    }),

  check('colors').optional().isArray().withMessage('Colors should be an array of strings'),

  check('imageCover').notEmpty().withMessage('Product image cover is required'),

  check('images').optional().isArray().withMessage('Images should be an array of strings'),

  // ✅ Validate Category
  check('category')
    .notEmpty()
    .withMessage('Product must belong to a category')
    .isMongoId()
    .withMessage('Invalid Category ID format')
    .bail()
    .custom(async (categoryId) => {
      const category = await CategoryModel.findById(categoryId);
      if (!category) throw new Error(`No category found for ID: ${categoryId}`);
      return true;
    }),
  check('subcategories')
    .optional()
    .isArray()
    .withMessage('Subcategories must be an array of IDs')
    .bail()

    // ✅ 1. Prevent duplicate subcategory IDs
    .custom((subcategoriesIds) => {
      const uniqueIds = [...new Set(subcategoriesIds.map(String))];
      if (uniqueIds.length !== subcategoriesIds.length) {
        throw new Error('Duplicate subcategory IDs are not allowed');
      }
      return true;
    })

    // ✅ 2. Check if all subcategory IDs exist
    .custom(async (subcategoriesIds) => {
      const result = await SubCategory.find({
        _id: { $exists: true, $in: subcategoriesIds },
      });

      if (!result.length || result.length !== subcategoriesIds.length) {
        throw new Error('Invalid subcategory IDs');
      }

      return true;
    })

    // ✅ 3. Check that all subcategories belong to the given category
    .custom(async (val, { req }) => {
      if (!req.body.category) {
        throw new Error('Category is required when subcategories are provided');
      }

      const subcategories = await SubCategory.find({
        category: req.body.category,
      });

      const subCategoriesIdsInDB = subcategories.map((sub) => sub._id.toString());

      const allBelongToCategory = val.every((id) => subCategoriesIdsInDB.includes(id));

      if (!allBelongToCategory) {
        throw new Error('Some subcategories do not belong to the specified category');
      }

      return true;
    }),

  // ✅ Validate Brand
  check('brand').optional().isMongoId().withMessage('Invalid Brand ID format'),

  // ✅ Ratings
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

/* -------------------------------------------------------------
   🧩 GET Product Validator
------------------------------------------------------------- */
export const getProductValidator = [mongoIdValidator('id', 'Product'), validatorMiddleware];

/* -------------------------------------------------------------
   🧩 UPDATE Product Validator
------------------------------------------------------------- */
export const updateProductValidator = [
  mongoIdValidator('id', 'Product'),
  body('title')
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val, { lower: true });
      return true;
    }),
  validatorMiddleware,
];

/* -------------------------------------------------------------
   🧩 DELETE Product Validator
------------------------------------------------------------- */
export const deleteProductValidator = [mongoIdValidator('id', 'Product'), validatorMiddleware];
/* -------------------------------------------------------------*/
