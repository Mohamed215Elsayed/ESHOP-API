import express from 'express';
import {
  addProductToCart,
  getLoggedUserCart,
  removeSpecificCartItem,
  clearCart,
  updateCartItemQuantity,
  applyCoupon,
} from '../controllers/CartController.js';
import { protect, allowedTo } from '../controllers/AuthController.js';
import {
  addProductToCartValidator,
  updateCartItemQuantityValidator,
  removeSpecificCartItemValidator,
  applyCouponValidator,
} from '../utils/validators/cartValidator.js';

const router = express.Router();

// 🛡️ Protect all routes and allow only users
router.use(protect, allowedTo('user'));

// 🛒 Cart routes
router
  .route('/')
  .post(addProductToCartValidator, addProductToCart)
  .get(getLoggedUserCart)
  .delete(clearCart);

// 💸 Apply coupon to cart
router.put('/applyCoupon', applyCouponValidator, applyCoupon);

// 🧾 Manage specific cart items
router
  .route('/:itemId')
  .put(updateCartItemQuantityValidator, updateCartItemQuantity)
  .delete(removeSpecificCartItemValidator, removeSpecificCartItem);

export default router;
