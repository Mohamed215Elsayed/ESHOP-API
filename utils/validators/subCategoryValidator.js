import { check, body } from 'express-validator';
import validatorMiddleware from '../../middlewares/validatorMiddleware.js';
import { mongoIdValidator } from './mongoIdValidator.js';
import slugify from 'slugify';

// ✅ GET /:id → Validate SubCategory ID
export const getSubCategoryValidator = [mongoIdValidator('id', 'SubCategory'), validatorMiddleware];

// ✅ POST / → Validate creation data
export const createSubCategoryValidator = [
  check('name')
    .notEmpty()
    .withMessage('SubCategory name is required')
    .isLength({ min: 2 })
    .withMessage('Too short SubCategory name')
    .isLength({ max: 32 })
    .withMessage('Too long SubCategory name')
    .trim()
    .custom((val, { req }) => {
      req.body.slug = slugify(val, { lower: true });
      return true;
    }),
  check('category')
    .notEmpty()
    .withMessage('SubCategory must belong to a category')
    .isMongoId()
    .withMessage('Invalid category ID format'),
  validatorMiddleware,
];

// ✅ PUT /:id → Validate update data
export const updateSubCategoryValidator = [
  mongoIdValidator('id', 'SubCategory'),
  check('name')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Too short SubCategory name')
    .isLength({ max: 32 })
    .withMessage('Too long SubCategory name')
    .trim(),
  body('name')
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val, { lower: true });
      return true;
    }),
  check('category')
    .optional() //1 in validation 2-add in controller categoryId from params 3 in route add before createSubCategoryValidator
    .isMongoId()
    .withMessage('Invalid category ID format'),
  validatorMiddleware,
];

// ✅ DELETE /:id → Validate ID
export const deleteSubCategoryValidator = [
  mongoIdValidator('id', 'SubCategory'),
  validatorMiddleware,
];

// ✅ GET / → Basic middleware (optional placeholder)
export const getSubCategoriesValidator = [validatorMiddleware];
