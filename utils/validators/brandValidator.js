import { check, body } from 'express-validator';
import validatorMiddleware from '../../middlewares/validatorMiddleware.js';
import { mongoIdValidator } from './mongoIdValidator.js';
import slugify from 'slugify';

// ✅ GET /:id
export const getBrandValidator = [mongoIdValidator('id', 'Brand'), validatorMiddleware];

// ✅ CREATE
export const createBrandValidator = [
  check('name')
    .notEmpty()
    .withMessage('Brand required')
    .isLength({ min: 2 })
    .withMessage('Too short Brand name')
    .isLength({ max: 32 })
    .withMessage('Too long Brand name')
    .custom((val, { req }) => {
      req.body.slug = slugify(val, { lower: true });
      return true;
    }),
  validatorMiddleware,
];

// ✅ UPDATE /:id
export const updateBrandValidator = [
  mongoIdValidator('id', 'Brand'),
  body('name')
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val, { lower: true });
      return true;
    }),
  validatorMiddleware,
];

// ✅ DELETE /:id
export const deleteBrandValidator = [mongoIdValidator('id', 'Brand'), validatorMiddleware];
