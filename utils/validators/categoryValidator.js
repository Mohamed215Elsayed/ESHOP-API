import { check, body } from 'express-validator';
import validatorMiddleware from '../../middlewares/validatorMiddleware.js';
import { mongoIdValidator } from './mongoIdValidator.js';
import slugify from 'slugify';

// ✅ GET /:id
export const getCategoryValidator = [mongoIdValidator('id', 'Category'), validatorMiddleware];

// ✅ CREATE
export const createCategoryValidator = [
  check('name')
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 3 })
    .withMessage('Category name must be at least 3 characters long')
    .isLength({ max: 32 })
    .withMessage('Category name must not exceed 32 characters')
    .trim()
    .custom((val, { req }) => {
      req.body.slug = slugify(val, { lower: true });
      return true;
    }),
  ,
  validatorMiddleware,
];

// ✅ UPDATE /:id
export const updateCategoryValidator = [
  mongoIdValidator('id', 'Category'),
  check('name').optional().trim(),
  body('name')
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val, { lower: true });
      return true;
    }),
  validatorMiddleware,
];

// ✅ DELETE /:id
export const deleteCategoryValidator = [mongoIdValidator('id', 'Category'), validatorMiddleware];
