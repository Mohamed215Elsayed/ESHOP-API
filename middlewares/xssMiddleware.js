// middlewares/xssMiddleware.js
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss';

export const mongoSanitizeMiddleware = (req, res, next) => {
  try {
    // clone safely instead of reassigning getters
    const clean = (obj) => {
      if (!obj || typeof obj !== 'object') return;
      for (const key of Object.keys(obj)) {
        if (key.startsWith('$') || key.includes('.')) delete obj[key];
        else if (typeof obj[key] === 'object') clean(obj[key]);
      }
    };
    clean(req.body);
    clean(req.query);
    clean(req.params);
    next();
  } catch (err) {
    console.error('Mongo sanitize error:', err);
    next();
  }
};

// XSS cleaner (same as before)
export const sanitizeInput = (req, res, next) => {
  const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'string') obj[key] = xss(obj[key]);
      else if (typeof obj[key] === 'object') sanitizeObject(obj[key]);
    }
  };
  sanitizeObject(req.body);
  sanitizeObject(req.query);
  sanitizeObject(req.params);
  next();
};
