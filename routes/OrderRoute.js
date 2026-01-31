import express from 'express';
import {
  createCashOrder,
  findAllOrders,
  findSpecificOrder,
  filterOrderForLoggedUser,
  updateOrderToPaid,
  updateOrderToDelivered,
  checkoutSession,
  deleteOrder,
} from '../controllers/OrderController.js';
import { protect, allowedTo } from '../controllers/AuthController.js';
const router = express.Router();
// 🔒 Protect all routes
router.use(protect);
// 💳 Stripe checkout session
router.post('/checkout-session/:cartId', allowedTo('user'), checkoutSession);

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
// 🗑️ Delete order (admin/manager only)
router.delete('/:id', allowedTo('admin', 'manager'), deleteOrder);
export default router;
