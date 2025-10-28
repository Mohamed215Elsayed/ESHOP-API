import ApiError from '../utils/apiError.js';

// 🧠 Helpers for known Mongoose & JWT errors
const handleCastErrorDB = (err) => new ApiError(`Invalid ${err.path}: ${err.value}`, 400);

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue || {})[0];
  const value = err.keyValue ? err.keyValue[field] : 'unknown';
  return new ApiError(`Duplicate value: "${value}" for field "${field}".`, 400);
};

const handleValidationErrorDB = (err) => {
  const messages = Object.values(err.errors || {}).map((el) => el.message);
  return new ApiError(`Invalid input data. ${messages.join('. ')}`, 400);
};

const handleJwtInvalidSignature = () => new ApiError('Invalid token, please log in again.', 401);

const handleJwtExpired = () => new ApiError('Expired token, please log in again.', 401);

// 🧾 Detailed developer error (dev mode)
const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

// 🚀 User-friendly error (production mode)
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    // Expected (handled) error
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Unexpected / programming error
    console.error('❌ UNEXPECTED ERROR:', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong! Please try again later.',
    });
  }
};

// 🌍 Global Error Middleware
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode ||= 500;
  err.status ||= 'error';

  const env = process.env.NODE_ENV?.trim() || 'development';

  if (env === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err, message: err.message };

    // 🔍 Detect known errors
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJwtInvalidSignature();
    if (err.name === 'TokenExpiredError') error = handleJwtExpired();

    sendErrorProd(error, res);
  }
};

export default globalErrorHandler;

/*-----------------*/
