import express from 'express';
import { protect, allowedTo } from '../controllers/AuthController.js';
import {
  addProductToWishlist,
  removeProductFromWishlist,
  getLoggedUserWishlist,
} from '../controllers/WishlistController.js';
import {
  addProductToWishlistValidator,
  removeProductFromWishlistValidator,
} from '../utils/validators/wishlistValidator.js';
const router = express.Router();

// ✅ Protect all wishlist routes (only logged-in users with 'user' role)
router.use(protect, allowedTo('user'));

// ✅ /api/v1/wishlist
router
  .route('/')
  .post(addProductToWishlistValidator, addProductToWishlist)
  .get(getLoggedUserWishlist);

// ✅ /api/v1/wishlist/:productId
router.delete('/:productId', removeProductFromWishlistValidator, removeProductFromWishlist);

export default router;
