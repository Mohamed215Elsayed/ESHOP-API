// app.js
import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });
import Stripe from 'stripe';
const stripe = new Stripe(
  process.env.STRIPE_SECRET
  // , {apiVersion: '2025-01-27'}
);

/*--------------------------------------------------------*/
import asyncHandler from 'express-async-handler';
import ApiError from '../utils/apiError.js';
import CartModel from '../models/CartModel.js';
import OrderModel from '../models/OrderModel.js';
import ProductModel from '../models/ProductModel.js';
import * as factory from '../services/handlersFactory.js';
/*--------------------------------------------------------*/
// @desc    Create a cash order from a specific cart
// @route   POST /api/v1/orders/:cartId
// @access  Protected/User
export const createCashOrder = asyncHandler(async (req, res, next) => {
  // 0️⃣ Initialize variables app settings for admin
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1️⃣ Get the user's cart by ID
  const cart = await CartModel.findById(req.params.cartId);
  if (!cart) {
    return next(new ApiError(`No cart found with id ${req.params.cartId}`, 404));
  }

  // 2️⃣ Calculate total order price
  const cartPrice = cart.totalPriceAfterDiscount ?? cart.totalCartPrice;
  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 3️⃣ Create the order (default payment method: cash)
  const order = await OrderModel.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
    paymentMethodType: 'cash', //it's default value
  });

  // 4️⃣ Update product stock and sold count
  if (order) {
    const bulkUpdates = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: {
          $inc: {
            quantity: -item.quantity,
            sold: +item.quantity,
          },
        },
      },
    }));
    await ProductModel.bulkWrite(bulkUpdates);
    // 5️⃣ Clear the cart after order creation
    await CartModel.findByIdAndDelete(req.params.cartId);
  }

  //6️⃣ Send response
  res.status(201).json({
    status: 'success',
    message: 'Cash order created successfully',
    data: order,
  });
});

/**
 * @desc   Filter orders for the logged-in user (only show their own)
 * @route  Middleware
 * @access Protected/User
 */
export const filterOrderForLoggedUser = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'user') {
    req.filterObj = { user: req.user._id };
  }
  next();
});

/**
 * @desc   Get all orders
 * @route  GET /api/v1/orders
 * @access Protected (User, Admin, Manager)
 */
export const findAllOrders = factory.getAll(OrderModel);

/**
 * @desc   Get specific order by ID
 * @route  GET /api/v1/orders/:id
 * @access Protected (User, Admin, Manager)
 */
export const findSpecificOrder = factory.getOne(OrderModel);

/**
 * @desc    Update order payment status to "Paid"
 * @route   PUT /api/v1/orders/:id/pay
 * @access  Protected/Admin-Manager
 */
export const updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await OrderModel.findById(req.params.id);
  if (!order) {
    return next(new ApiError(`No order found with ID: ${req.params.id}`, 404));
  }

  // Mark as paid
  order.isPaid = true;
  order.paidAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({
    status: 'success',
    message: 'Order marked as paid successfully',
    data: updatedOrder,
  });
});

/**
 * @desc    Update order delivery status to "Delivered"
 * @route   PUT /api/v1/orders/:id/deliver
 * @access  Protected/Admin-Manager
 */
export const updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const order = await OrderModel.findById(req.params.id);
  if (!order) {
    return next(new ApiError(`No order found with ID: ${req.params.id}`, 404));
  }

  // Mark as delivered
  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({
    status: 'success',
    message: 'Order marked as delivered successfully',
    data: updatedOrder,
  });
});
/**
 * @desc    Create Stripe checkout session
 * @route   GET /api/v1/orders/checkout-session/:cartId
 * @access  Protected/User
 */
export const checkoutSession = asyncHandler(async (req, res, next) => {
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1️⃣ Find cart by ID
  const cart = await CartModel.findById(req.params.cartId);
  if (!cart) {
    return next(new ApiError(`No cart found with ID ${req.params.cartId}`, 404));
  }

  // 2️⃣ Calculate total price (apply discount if exists)
  const cartPrice = cart.totalPriceAfterDiscount ?? cart.totalCartPrice;
  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 3️⃣ Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'egp',
          product_data: { name: req.user.name }, //user name
          unit_amount: totalOrderPrice * 100,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/orders`,
    cancel_url: `${req.protocol}://${req.get('host')}/cart`,
    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata: req.body.shippingAddress,
  });

  // 4️⃣ Send session to client
  res.status(200).json({
    status: 'success',
    message: 'Stripe checkout session created successfully',
    session,
  });
});

/**
 * Helper: Create order after successful card payment
 */
const createCardOrder = async (session) => {
  const cartId = session.client_reference_id;
  const shippingAddress = session.metadata;
  const orderPrice = session.amount_total / 100;

  const cart = await CartModel.findById(cartId);
  const user = await UserModel.findOne({ email: session.customer_email });

  // 1️⃣ Create the order
  const order = await OrderModel.create({
    user: user._id,
    cartItems: cart.cartItems,
    shippingAddress,
    totalOrderPrice: orderPrice,
    isPaid: true,
    paidAt: Date.now(),
    paymentMethodType: 'card',
  });

  // 2️⃣ Update product inventory
  if (order) {
    const bulkUpdates = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: {
          $inc: { quantity: -item.quantity, sold: +item.quantity },
        },
      },
    }));

    await ProductModel.bulkWrite(bulkUpdates);

    // 3️⃣ Clear the cart
    await CartModel.findByIdAndDelete(cartId);
  }
};

/**
 * @desc    Stripe webhook to handle successful checkout
 * @route   POST /webhook-checkout
 * @access  Public
 */
export const webhookCheckout = asyncHandler(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful payment
  if (event.type === 'checkout.session.completed') {
    await createCardOrder(event.data.object);
  }

  res.status(200).json({ received: true });
});
