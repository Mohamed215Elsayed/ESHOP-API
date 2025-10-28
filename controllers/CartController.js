import asyncHandler from 'express-async-handler';
import ApiError from '../utils/apiError.js';

import ProductModel from '../models/ProductModel.js';
import CartModel from '../models/CartModel.js';
import CouponModel from '../models/CouponModel.js';

/**
 * @desc    Calculate the total cart price
 */
const calcTotalCartPrice = (cart) => {
  const totalPrice = cart.cartItems.reduce((acc, item) => acc + item.quantity * item.price, 0);
  cart.totalCartPrice = totalPrice;
  cart.totalPriceAfterDiscount = undefined;
  return totalPrice;
};

/**
 * @desc    Add product to cart
 * @route   POST /api/v1/cart
 * @access  Private/User
 */
export const addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, color } = req.body;
  const product = await ProductModel.findById(productId);
  if (!product) return next(new ApiError('Product not found', 404));
  //لو مش عندك كارت كاريتها
  // Get cart for logged-in user
  let cart = await CartModel.findOne({ user: req.user._id });
  if (!cart) {
    //1- Create a new cart with the first product
    cart = await CartModel.create({
      user: req.user._id,
      cartItems: [{ product: productId, color, price: product.price }],
    });
  } else {
    //2 Check if product already exists in the cart
    //هو عنده كارت لذلك عدل الكميه او ضيف المنتج الي هذه الكارت
    const productIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId && item.color === color
    ); // index of the product in the cart:0
    if (productIndex > -1) {
      // if product exists in the cart
      cart.cartItems[productIndex].quantity += 1;
    } else {
      // product not exist in cart,  push product to cartItems array
      cart.cartItems.push({ product: productId, color, price: product.price });
    }
  }

  calcTotalCartPrice(cart);
  await cart.save();

  res.status(200).json({
    status: 'success',
    message: 'Product added to cart successfully',
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

/**
 * @desc    Get logged user cart
 * @route   GET /api/v1/cart
 * @access  Private/User
 */
export const getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const cart = await CartModel.findOne({ user: req.user._id });

  if (!cart) {
    return next(new ApiError(`No cart found for user: ${req.user._id}`, 404));
  }
  res.status(200).json({
    status: 'success',
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

/**
 * @desc    Remove specific item from cart
 * @route   DELETE /api/v1/cart/:itemId
 * @access  Private/User
 */
export const removeSpecificCartItem = asyncHandler(async (req, res, next) => {
  const { itemId } = req.params;
  const cart = await CartModel.findOneAndUpdate(
    { user: req.user._id },
    { $pull: { cartItems: { _id: itemId } } },
    { new: true }
  );
  if (!cart) return next(new ApiError('Cart not found', 404));

  if (cart.cartItems.length > 0) {
    calcTotalCartPrice(cart);
    await cart.save();
  }

  res.status(200).json({
    status: 'success',
    message: 'Item removed successfully',
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});
// export const removeSpecificCartItem = asyncHandler(async (req, res, next) => {
//   const { itemId } = req.params;

//   // 🧩 Check if cart exists for this user
//   const cart = await CartModel.findOne({ user: req.user._id });
//   if (!cart) return next(new ApiError('Cart not found', 404));

//   // 🧾 Find the index of the item to remove
//   const itemIndex = cart.cartItems.findIndex((item) => item._id.toString() === itemId);

//   if (itemIndex === -1) {
//     return next(new ApiError(`No item found with id: ${itemId}`, 404));
//   }

//   // 🗑️ Remove the item
//   cart.cartItems.splice(itemIndex, 1);

//   // 🧮 Recalculate totals
//   if (cart.cartItems.length > 0) {
//     let totalPrice = 0;
//     cart.cartItems.forEach((item) => {
//       totalPrice += item.quantity * item.price;
//     });
//     cart.totalCartPrice = totalPrice;
//     cart.totalPriceAfterDiscount = undefined;
//   } else {
//     cart.totalCartPrice = 0;
//     cart.totalPriceAfterDiscount = undefined;
//   }

//   await cart.save();

//   res.status(200).json({
//     status: 'success',
//     message: 'Item removed successfully',
//     numOfCartItems: cart.cartItems.length,
//     data: cart,
//   });
// });
/**
 * @desc    Clear logged user cart
 * @route   DELETE /api/v1/cart
 * @access  Private/User
 */
export const clearCart = asyncHandler(async (req, res) => {
  await CartModel.findOneAndDelete({ user: req.user._id });
  res.status(204).json({ status: 'success', message: 'Cart cleared' });
});

/**
 * @desc    Update specific cart item quantity
 * @route   PUT /api/v1/cart/:itemId
 * @access  Private/User
 */
export const updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  if (quantity <= 0) return next(new ApiError('Quantity must be greater than zero', 400));
  const cart = await CartModel.findOne({ user: req.user._id });
  if (!cart) return next(new ApiError('Cart not found', 404));

  const itemIndex = cart.cartItems.findIndex((item) => item._id.toString() === req.params.itemId);

  if (itemIndex === -1)
    return next(new ApiError(`No item found with id: ${req.params.itemId}`, 404));

  cart.cartItems[itemIndex].quantity = quantity;

  calcTotalCartPrice(cart);
  await cart.save();

  res.status(200).json({
    status: 'success',
    message: 'Cart item updated successfully',
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

/**
 * @desc    Apply coupon to logged user cart
 * @route   PUT /api/v1/cart/applyCoupon
 * @access  Private/User
 */
export const applyCoupon = asyncHandler(async (req, res, next) => {
  const { coupon } = req.body;
  const validCoupon = await CouponModel.findOne({ name: coupon, expire: { $gt: Date.now() } });

  if (!validCoupon) return next(new ApiError('Coupon is invalid or expired', 400));
  const cart = await CartModel.findOne({ user: req.user._id });
  if (!cart) return next(new ApiError('Cart not found', 404));

  const totalPrice = cart.totalCartPrice;
  //   const totalPrice = calcTotalCartPrice(cart);

  const totalPriceAfterDiscount = (totalPrice - (totalPrice * validCoupon.discount) / 100).toFixed(
    2
  ); //500 - (500*10)/100=450

  cart.totalPriceAfterDiscount = totalPriceAfterDiscount;
  await cart.save();

  res.status(200).json({
    status: 'success',
    message: 'Coupon applied successfully',
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});
