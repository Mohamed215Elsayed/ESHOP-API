import express from 'express';
import {
  createCashOrder,
  findAllOrders,
  findSpecificOrder,
  filterOrderForLoggedUser,
  updateOrderToPaid,
  updateOrderToDelivered,
  checkoutSession,
} from '../controllers/OrderController.js';
import { protect, allowedTo } from '../controllers/AuthController.js';
const router = express.Router();
// 🔒 Protect all routes
router.use(protect);
// 💳 Stripe checkout session
router.get('/checkout-session/:cartId', allowedTo('user'), checkoutSession);

// 💵 Create cash order
router.post('/:cartId', allowedTo('user'), createCashOrder);
// 📦 Get all orders (filtered for user if not admin/manager)
router.get('/', allowedTo('user', 'admin', 'manager'), filterOrderForLoggedUser, findAllOrders);
// 📄 Get specific order by ID
router.get('/:id', allowedTo('user', 'admin', 'manager'), findSpecificOrder);
// ✅ Mark order as paid (admin/manager only)
router.put('/:id/pay', allowedTo('admin', 'manager'), updateOrderToPaid);
// 🚚 Mark order as delivered (admin/manager only)
router.put('/:id/deliver', allowedTo('admin', 'manager'), updateOrderToDelivered);
export default router;
