// ---------------------------------------------
// 🌍 Environment Setup (must come first)
// ---------------------------------------------
import dotenv from 'dotenv';
// ===============================================================
// ⚙️ Core Imports & Initialization
// ===============================================================
import path from 'path';
import express from 'express';
import morgan from 'morgan';
import colors from 'colors';
import chalk from 'chalk';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import helmet from 'helmet';
import { mongoSanitizeMiddleware, sanitizeInput } from './middlewares/xssMiddleware.js';
// ---------------------------------------------
import connectDB from './config/database.js';
import mountRoutes from './routes/index.js';
import ApiError from './utils/apiError.js';
import globalErrorHandler from './middlewares/globalErrorHandler.js';
import { webhookCheckout } from './controllers/OrderController.js';
// ---------------------------------------------
process.env.DOTENV_LOG = 'false'; // Hide dotenv startup logs
dotenv.config({ path: './config.env', silent: true, quiet: true });
// ---------------------------------------------
// 🧠 Global Uncaught Exception Handler (Sync Errors)
// 💥 Global Sync Error Catcher (Uncaught Exceptions)
// ---------------------------------------------
process.on('uncaughtException', (err) => {
  console.log('\n💥 '.red.bold + 'UNCAUGHT EXCEPTION! Shutting down...'.bgRed.white);
  console.error(`${'Name:'.yellow} ${err.name}`);
  console.error(`${'Message:'.yellow} ${err.message}`);
  console.error(`${'Stack:'.gray} ${err.stack}`);
  process.exit(1);
});

// ---------------------------------------------
// 💾 Database Connection
// ---------------------------------------------
connectDB();
// ---------------------------------------------
// 🚀 Express App Setup
// ---------------------------------------------
const app = express();
// Checkout webhook
app.post('/webhook-checkout', express.raw({ type: 'application/json' }), webhookCheckout);
// ---------------------------------------------
// 📦 Request Body Middleware
// ---------------------------------------------
app.use(express.json({ limit: '20kb' })); //Set request size limits
// ---------------------------------------------
// ---------------------------------------------
// 🛡️ Security Middlewares
// ---------------------------------------------
//  Secure HTTP headers
app.use(
  helmet({
    // Example: custom options (you can leave empty for defaults)
    crossOriginEmbedderPolicy: true,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    referrerPolicy: { policy: 'no-referrer' },
  })
);

// 2Content Security Policy (blocks inline JS and external scripts)
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // allow inline styles if needed
      imgSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);
// Data Sanitization against XSS attacks
// Sanitize input to prevent NoSQL Injection & XSS
app.use(mongoSanitizeMiddleware);
app.use(sanitizeInput);

// ---------------------------------------------
// 🛡️ CORS Middleware
// ---------------------------------------------
// Enable other domains to access your application
app.use(cors());
app.options(/.*/, cors());

// compress all responses
app.use(compression());

// 📁 Static Files Middleware
// ---------------------------------------------
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log(`🧩 ${'Running in'.cyan} ${process.env.NODE_ENV.bgCyan.black} mode`);
}

// ---------------------------------------------
// 🛡️ Rate Limiter Middleware
// ---------------------------------------------
// Limit each IP to 100 requests per `window` (here, per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many accounts created from this IP, please try again after an hour',
});

// Apply the rate limiting middleware to all requests
app.use('/api', limiter);

// ---------------------------------------------
// 🛡️ Prevent HTTP Parameter Pollution
// ---------------------------------------------
app.use(
  hpp({
    whitelist: ['price', 'sold', 'quantity', 'ratingsAverage', 'ratingsQuantity'],
  })
);

// ---------------------------------------------
// 🛡️ Prevent MongoDB Injection
//it's an intremediate layer between the client(frontend-postman) and the database --app.js --mongoSanitize --xvalidateor.js
// ---------------------------------------------
// 🛡️ CSRF Protection Middleware
// ---------------------------------------------
// import cookieParser from 'cookie-parser';
// import { doubleCsrfProtection } from './middlewares/csrfProtection.js';
// app.use(cookieParser());
// app.use(doubleCsrfProtection);
// import { generateToken } from './middlewares/csrfProtection.js';

// app.get('/api/csrf-token', (req, res) => {
//   const token = generateToken(req, res);
//   res.json({ csrfToken: token });
// });
// // Your frontend can call /api/csrf-token and include the token in the X-CSRF-Token header
// // for any POST/PUT/DELETE requests.
// // You can protect any route like this:
// import { validateRequest } from './middlewares/csrfProtection.js';
// app.post('/api/secure-action', validateRequest, (req, res) => {
//   res.json({ message: 'CSRF token validated successfully!' });
// });

// ---------------------------------------------
// 🛣️ Mount Routes
// ---------------------------------------------
mountRoutes(app);

// ---------------------------------------------
// ❌ Handle Unhandled Routes
// ---------------------------------------------
app.use((req, res, next) => {
  next(new ApiError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// ---------------------------------------------
// 🧱 Global Error Handler Middleware
// ---------------------------------------------
app.use(globalErrorHandler);

// ---------------------------------------------
// 🖥️ Start Server
// ---------------------------------------------
const PORT = process.env.PORT || 8000;
if (process.env.NODE_ENV !== 'production') {
  const server = app.listen(PORT, () => {
    console.log(
      `\n🚀 ${'Server running on:'.green.bold} ${`http://localhost:${PORT}`.underline.cyan}`
    );
  });
} else {
  const server = app.listen(PORT, () => {
    console.log(`\n🚀 ${'Server running on port:'.green.bold} ${`${PORT}`.underline.cyan}`);
  });
}
// ---------------------------------------------
// 🔥 Handle Unhandled Promise Rejections (Async Errors)
// ---------------------------------------------
process.on('unhandledRejection', (err) => {
  console.log('\n❌ '.chalk.red.bold + 'UNHANDLED REJECTION! Shutting down...'.bgRed.white);
  console.error(`${'Name:'.yellow} ${err.name}`);
  console.error(`${'Message:'.yellow} ${err.message}`);
  console.error(`${'Stack:'.gray} ${err.stack}`);

  // Graceful shutdown
  server.close(() => {
    console.log(`${chalk.red.bold('🛑 Server closed.')} ${chalk.white('Exiting process...')}`);
    process.exit(1);
  });
});
// ✅ Export app for Vercel
export default app;
