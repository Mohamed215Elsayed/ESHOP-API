// ---------------------------------------------
// 🌍 Environment Setup (must come first)
// ---------------------------------------------
import dotenv from 'dotenv';
// process.env.DOTENV_LOG = 'false'; // Hide dotenv startup logs
// dotenv.config({ path: './config.env', silent: true, quiet: true });
dotenv.config({ path: './config.env' });

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
// 🧠💥 Global Uncaught Exception Handler (Sync Errors)
// ---------------------------------------------
process.on('uncaughtException', (err) => {
  console.log('\n💥 '.red.bold + 'UNCAUGHT EXCEPTION! Shutting down...'.bgRed.white);
  console.error(`${'Name:'.yellow} ${err.name}`);
  console.error(`${'Message:'.yellow} ${err.message}`);
  console.error(`${'Stack:'.gray} ${err.stack}`);
  process.exit(1);
});

// ---------------------------------------------
// 🚀 Express App Setup
// ---------------------------------------------
const app = express();
//1. Trust Vercel proxy(important for rate limiting and logging)
app.set('trust proxy', 1);

// Stripe Webhook
app.post('/webhook-checkout', express.raw({ type: 'application/json' }), webhookCheckout);

// ---------------------------------------------
// 🛡️ Security Middlewares
// ---------------------------------------------
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    referrerPolicy: { policy: 'no-referrer' },
  })
);
// // 2Content Security Policy (blocks inline JS and external scripts)
// // app.use(
// //   helmet.contentSecurityPolicy({
// //     directives: {
// //       defaultSrc: ["'self'"],
// //       scriptSrc: ["'self'"],
// //       styleSrc: ["'self'", "'unsafe-inline'"], // allow inline styles if needed
// //       imgSrc: ["'self'", 'data:'],
// //       objectSrc: ["'none'"],
// //       upgradeInsecureRequests: [],
// //     },
// //   })
// // );
// 3. Sanitize data (NoSQL + XSS) - Data Sanitization against XSS attacks and NoSQL injection. Sanitize input to prevent NoSQL Injection & XSS
// Data Sanitization (NoSQL Injection + XSS)
app.use(mongoSanitizeMiddleware);
app.use(sanitizeInput);

// Prevent HTTP Parameter Pollution
app.use(
  hpp({
    whitelist: ['price', 'sold', 'quantity', 'ratingsAverage', 'ratingsQuantity'],
  })
);

// Parse JSON requests
app.use(express.json({ limit: '20kb' }));

// Response Compression
app.use(compression());

// CORS
app.use(cors());
app.options(/.*/, cors());

// Static Files
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------------------------------------------
// 🧩 Development Logging
// ---------------------------------------------
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log(chalk.magenta.bold(`🧠 Environment: ${process.env.NODE_ENV}`));
  console.log(chalk.green.bold(`💾 Mongo URI: ${process.env.MONGO_URI ? 'Loaded' : 'Missing!'}`));
}

// ---------------------------------------------
// 🛡️ Rate Limiting
// ---------------------------------------------
// Limit each IP to 100 requests per `window` (here, per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
// Apply the rate limiting middleware to all requests
app.use('/api', limiter);

// ---------------------------------------------
// 📬 Test & Health Routes
// ---------------------------------------------
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: '🚀 Eshop API is running successfully!',
  });
});
app.get('/health', (req, res) => res.send('OK'));

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
// 🧱 Global Error Handler
// ---------------------------------------------
app.use(globalErrorHandler);

// ---------------------------------------------
// 💾 Database Connection & Server Startup
// ---------------------------------------------
const PORT = process.env.PORT || 8000;
let server;

const startServer = async () => {
  try {
    await connectDB(); // ✅ Wait for DB before starting server

    if (process.env.NODE_ENV !== 'production') {
      server = app.listen(PORT, () => {
        console.log(
          `\n🚀 ${'Server running on:'.green.bold} ${`http://localhost:${PORT}`.underline.cyan}`
        );
      });
    }
  } catch (err) {
    console.error(chalk.red.bold('❌ Failed to start server!'));
    console.error(`${'Name:'.yellow} ${err.name}`);
    console.error(`${'Message:'.yellow} ${err.message}`);
    process.exit(1);
  }
};

startServer();

// ---------------------------------------------
// 🔥 Handle Unhandled Promise Rejections
// ---------------------------------------------
process.on('unhandledRejection', (err) => {
  console.log(chalk.red.bold('\n❌ UNHANDLED REJECTION! Shutting down...'));
  console.error(`${'Name:'.yellow} ${err.name}`);
  console.error(`${'Message:'.yellow} ${err.message}`);
  console.error(`${'Stack:'.gray} ${err.stack}`);

  if (server) {
    server.close(() => {
      console.log(chalk.yellow.bold('🧹 Server closed due to rejection.'));
      process.exit(1);
    });
  }
});

// ✅ Export app for Vercel
export default app;
