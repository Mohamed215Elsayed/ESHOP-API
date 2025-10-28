import { validationResult } from 'express-validator';
import ApiError from '../utils/apiError.js';
// @desc  Finds the validation errors in this request and wraps them in an object with handy functions
const validatorMiddleware = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Create a readable message combining all validation errors
    const errorMessages = errors
      .array()
      .map((err) => `${err.param}: ${err.msg}`)
      .join(', ');

    // Pass the error to your global error handler
    return next(new ApiError(`Validation Error: ${errorMessages}`, 400));
  }

  next();
};

export default validatorMiddleware;
