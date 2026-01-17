import { validationResult } from 'express-validator';
import ApiError from '../utils/apiError.js';

const validatorMiddleware = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors
      .array()
      .map((err) => (err.param && err.param !== 'undefined' ? `${err.param}: ${err.msg}` : err.msg))
      .join(', ');

    return next(new ApiError(`Validation Error: ${errorMessages}`, 400));
  }

  next();
};

export default validatorMiddleware;

/*
const formattedErrors = errors.array().map(err => ({
  field: err.param || null,
  message: err.msg,
}));

return next(
  new ApiError(
    JSON.stringify({
      type: 'validation',
      errors: formattedErrors,
    }),
    400
  )
);
*/
