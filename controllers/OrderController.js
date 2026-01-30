// // app.js
// import dotenv from 'dotenv';
// dotenv.config({ path: './config.env' });
// import Stripe from 'stripe';
// const stripe = new Stripe(
//   process.env.STRIPE_SECRET
//   // , {apiVersion: '2025-01-27'}
// );

// /*--------------------------------------------------------*/
// import asyncHandler from 'express-async-handler';
// import ApiError from '../utils/apiError.js';
// import CartModel from '../models/CartModel.js';
// import OrderModel from '../models/OrderModel.js';
// import ProductModel from '../models/ProductModel.js';
// import UserModel from '../models/UserModel.js';
// import * as factory from '../services/handlersFactory.js';
// /*--------------------------------------------------------*/
// // @desc    Create a cash order from a specific cart
// // @route   POST /api/v1/orders/:cartId
// // @access  Protected/User
// export const createCashOrder = asyncHandler(async (req, res, next) => {
//   // 0️⃣ Initialize variables app settings for admin
//   const taxPrice = 0;
//   const shippingPrice = 0;

//   // 1️⃣ Get the user's cart by ID
//   const cart = await CartModel.findById(req.params.cartId);
//   if (!cart) {
//     return next(new ApiError(`No cart found with id ${req.params.cartId}`, 404));
//   }

//   // 2️⃣ Calculate total order price
//   const cartPrice = cart.totalPriceAfterDiscount ?? cart.totalCartPrice;
//   const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

//   // 3️⃣ Create the order (default payment method: cash)
//   const order = await OrderModel.create({
//     user: req.user._id,
//     cartItems: cart.cartItems,
//     shippingAddress: req.body.shippingAddress,
//     totalOrderPrice,
//     paymentMethodType: 'cash', //it's default value
//   });

//   // 4️⃣ Update product stock and sold count
//   if (order) {
//     const bulkUpdates = cart.cartItems.map((item) => ({
//       updateOne: {
//         filter: { _id: item.product },
//         update: {
//           $inc: {
//             quantity: -item.quantity,
//             sold: +item.quantity,
//           },
//         },
//       },
//     }));
//     await ProductModel.bulkWrite(bulkUpdates);
//     // 5️⃣ Clear the cart after order creation
//     await CartModel.findByIdAndDelete(req.params.cartId);
//   }

//   //6️⃣ Send response
//   res.status(201).json({
//     status: 'success',
//     message: 'Cash order created successfully',
//     data: order,
//   });
// });

// /**
//  * @desc   Filter orders for the logged-in user (only show their own)
//  * @route  Middleware
//  * @access Protected/User
//  */
// export const filterOrderForLoggedUser = asyncHandler(async (req, res, next) => {
//   if (req.user.role === 'user') {
//     req.filterObj = { user: req.user._id };
//   }
//   next();
// });

// /**
//  * @desc   Get all orders
//  * @route  GET /api/v1/orders
//  * @access Protected (User, Admin, Manager)
//  */
// export const findAllOrders = factory.getAll(OrderModel);

// /**
//  * @desc   Get specific order by ID
//  * @route  GET /api/v1/orders/:id
//  * @access Protected (User, Admin, Manager)
//  */
// export const findSpecificOrder = factory.getOne(OrderModel);

// /**
//  * @desc    Update order payment status to "Paid"
//  * @route   PUT /api/v1/orders/:id/pay
//  * @access  Protected/Admin-Manager
//  */
// export const updateOrderToPaid = asyncHandler(async (req, res, next) => {
//   const order = await OrderModel.findById(req.params.id);
//   if (!order) {
//     return next(new ApiError(`No order found with ID: ${req.params.id}`, 404));
//   }

//   // Mark as paid
//   order.isPaid = true;
//   order.paidAt = Date.now();

//   const updatedOrder = await order.save();

//   res.status(200).json({
//     status: 'success',
//     message: 'Order marked as paid successfully',
//     data: updatedOrder,
//   });
// });

// /**
//  * @desc    Update order delivery status to "Delivered"
//  * @route   PUT /api/v1/orders/:id/deliver
//  * @access  Protected/Admin-Manager
//  */
// export const updateOrderToDelivered = asyncHandler(async (req, res, next) => {
//   const order = await OrderModel.findById(req.params.id);
//   if (!order) {
//     return next(new ApiError(`No order found with ID: ${req.params.id}`, 404));
//   }

//   // Mark as delivered
//   order.isDelivered = true;
//   order.deliveredAt = Date.now();

//   const updatedOrder = await order.save();

//   res.status(200).json({
//     status: 'success',
//     message: 'Order marked as delivered successfully',
//     data: updatedOrder,
//   });
// });
// /**
//  * @desc    Create Stripe checkout session
//  * @route   GET /api/v1/orders/checkout-session/:cartId
//  * @access  Protected/User
//  */
// export const checkoutSession = asyncHandler(async (req, res, next) => {
//   const taxPrice = 0;
//   const shippingPrice = 0;

//   // 1️⃣ Find cart by ID
//   const cart = await CartModel.findById(req.params.cartId);
//   if (!cart) {
//     return next(new ApiError(`No cart found with ID ${req.params.cartId}`, 404));
//   }

//   // 2️⃣ Calculate total price (apply discount if exists)
//   const cartPrice = cart.totalPriceAfterDiscount ?? cart.totalCartPrice;
//   const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

//   // 3️⃣ Create Stripe checkout session
//   const session = await stripe.checkout.sessions.create({
//     line_items: [
//       {
//         price_data: {
//           currency: 'egp',
//           product_data: { name: req.user.name }, //user name
//           unit_amount: totalOrderPrice * 100,
//         },
//         quantity: 1,
//       },
//     ],
//     mode: 'payment',
//     success_url: `${process.env.FRONTEND_URL}/user/allorders`,
//     cancel_url: `${process.env.FRONTEND_URL}/cart`,
//     // success_url: `${req.protocol}://${req.get('host')}/orders`,
//     // cancel_url: `${req.protocol}://${req.get('host')}/cart`,
//     customer_email: req.user.email,
//     client_reference_id: req.params.cartId,
//     // metadata: req.body.shippingAddress,
//     // metadata: req.body ? req.body.shippingAddress : {},
//     metadata: {
//       details: req.body.shippingAddress.details,
//       phone: req.body.shippingAddress.phone,
//       city: req.body.shippingAddress.city || '',
//       alias: req.body.shippingAddress.alias || '',
//       postalCode: req.body.shippingAddress.postalCode || '',
//     },
//   });

//   // 4️⃣ Send session to client
//   res.status(200).json({
//     status: 'success',
//     message: 'Stripe checkout session created successfully',
//     session,
//   });
// });

// /**
//  * Helper: Create order after successful (card payment)
//  */
// const createCardOrder = async (session) => {
//   //object === session
//   const cartId = session.client_reference_id;
//   console.log('cartId:', cartId);
//   const shippingAddress = session.metadata;
//   const orderPrice = session.amount_total / 100;

//   const cart = await CartModel.findById(cartId);
//   const user = await UserModel.findOne({ email: session.customer_email });

//   // 1️⃣ Create the order
//   const order = await OrderModel.create({
//     user: user._id,
//     cartItems: cart.cartItems,
//     // shippingAddress,
//     shippingAddress: {
//       details: shippingAddress.details,
//       phone: shippingAddress.phone,
//       city: shippingAddress.city,
//       alias: shippingAddress.alias,
//       postalCode: shippingAddress.postalCode,
//     },
//     totalOrderPrice: orderPrice,
//     isPaid: true,
//     paidAt: Date.now(),
//     paymentMethodType: 'card',
//   });

//   // 2️⃣ Update product inventory
//   if (order) {
//     const bulkUpdates = cart.cartItems.map((item) => ({
//       updateOne: {
//         filter: { _id: item.product },
//         update: {
//           $inc: { quantity: -item.quantity, sold: +item.quantity },
//         },
//       },
//     }));

//     await ProductModel.bulkWrite(bulkUpdates);

//     // 3️⃣ Clear the cart
//     await CartModel.findByIdAndDelete(cartId);
//   }
// };

// /**
//  * @desc    Stripe webhook to handle successful checkout
//  * @route   POST /webhook-checkout
//  * @access  Public
//  */
// export const webhookCheckout = asyncHandler(async (req, res, next) => {
//   const sig = req.headers['stripe-signature'];
//   let event;
//   try {
//     event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
//     console.log('✅ Webhook event received:', event.type);
//   } catch (err) {
//     console.log('❌ Webhook signature verification failed:', err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   if (event.type === 'checkout.session.completed') {
//     console.log('💳 Payment successful, creating order...');
//     await createCardOrder(event.data.object);
//   }

//   res.status(200).json({ received: true });
// });

// // export const webhookCheckout = asyncHandler(async (req, res, next) => {
// //   const sig = req.headers['stripe-signature'];
// //   let event;
// //   try {
// //     event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
// //   } catch (err) {
// //     return res.status(400).send(`Webhook Error: ${err.message}`);
// //   }
// //   // Handle successful payment
// //   if (event.type === 'checkout.session.completed') {
// //     await createCardOrder(event.data.object);
// //   }

// //   res.status(200).json({ received: true });
// // });
// // @desc    Delete a specific order
// // @route   DELETE /api/v1/orders/:id
// // @access  Protected/Admin-Manager
// export const deleteOrder = asyncHandler(async (req, res, next) => {
//   const order = await OrderModel.findById(req.params.id);
//   if (!order) {
//     return next(new ApiError(`No order found with ID: ${req.params.id}`, 404));
//   }

//   await OrderModel.findByIdAndDelete(req.params.id);

//   res.status(204).json({
//     status: 'success',
//     message: 'Order deleted successfully',
//     data: null,
//   });
// });

import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });

import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET);

import asyncHandler from 'express-async-handler';
import ApiError from '../utils/apiError.js';
import CartModel from '../models/CartModel.js';
import OrderModel from '../models/OrderModel.js';
import ProductModel from '../models/ProductModel.js';
import UserModel from '../models/UserModel.js';
import * as factory from '../services/handlersFactory.js';

/* =====================================================
   CASH ORDER
===================================================== */
export const createCashOrder = asyncHandler(async (req, res, next) => {
  const taxPrice = 0;
  const shippingPrice = 0;

  const cart = await CartModel.findById(req.params.cartId);
  if (!cart) {
    return next(new ApiError(`No cart found with id ${req.params.cartId}`, 404));
  }

  const cartPrice = cart.totalPriceAfterDiscount ?? cart.totalCartPrice;
  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  const order = await OrderModel.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
    paymentMethodType: 'cash',
  });

  if (order) {
    console.log('🧾 Cash order created:', order._id);

    const bulkUpdates = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: {
          $inc: { quantity: -item.quantity, sold: +item.quantity },
        },
      },
    }));

    await ProductModel.bulkWrite(bulkUpdates);
    await CartModel.findByIdAndDelete(req.params.cartId);

    console.log('🗑️ Cart deleted (cash):', req.params.cartId);
  }

  res.status(201).json({
    status: 'success',
    message: 'Cash order created successfully',
    data: order,
  });
});

/* =====================================================
   STRIPE CHECKOUT SESSION
===================================================== */
export const checkoutSession = asyncHandler(async (req, res, next) => {
  if (!req.body.shippingAddress) {
    return next(new ApiError('Shipping address is required', 400));
  }

  const cart = await CartModel.findById(req.params.cartId);
  if (!cart) {
    return next(new ApiError(`No cart found with ID ${req.params.cartId}`, 404));
  }

  const cartPrice = cart.totalPriceAfterDiscount ?? cart.totalCartPrice;
  const totalOrderPrice = cartPrice;

  console.log('🛒 Creating checkout for cart:', cart._id);

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'egp',
          product_data: { name: `Order for ${req.user.name}` },
          unit_amount: totalOrderPrice * 100,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.FRONTEND_URL}/user/allorders`,
    cancel_url: `${process.env.FRONTEND_URL}/cart`,
    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata: {
      details: req.body.shippingAddress.details,
      phone: req.body.shippingAddress.phone,
      city: req.body.shippingAddress.city || '',
      alias: req.body.shippingAddress.alias || '',
      postalCode: req.body.shippingAddress.postalCode || '',
    },
  });

  res.status(200).json({
    status: 'success',
    session,
  });
});

/* =====================================================
   CREATE CARD ORDER (FROM WEBHOOK)
===================================================== */
const createCardOrder = async (session) => {
  try {
    const cartId = session.client_reference_id;
    console.log('🔔 Webhook processing cart:', cartId);

    const cart = await CartModel.findById(cartId);
    if (!cart) {
      console.log('⚠️ Cart not found (already deleted?)');
      return;
    }

    const user = await UserModel.findOne({ email: session.customer_email });
    if (!user) {
      console.log('❌ User not found for email:', session.customer_email);
      return;
    }

    const existingOrder = await OrderModel.findOne({ cartId });
    if (existingOrder) {
      console.log('⚠️ Order already created for this cart');
      return;
    }

    const orderPrice = session.amount_total / 100;
    const shippingAddress = session.metadata;

    const order = await OrderModel.create({
      user: user._id,
      cartItems: cart.cartItems,
      shippingAddress: {
        details: shippingAddress.details,
        phone: shippingAddress.phone,
        city: shippingAddress.city,
        alias: shippingAddress.alias,
        postalCode: shippingAddress.postalCode,
      },
      totalOrderPrice: orderPrice,
      isPaid: true,
      paidAt: Date.now(),
      paymentMethodType: 'card',
    });

    console.log('✅ Card order created:', order._id);

    const bulkUpdates = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: {
          $inc: { quantity: -item.quantity, sold: +item.quantity },
        },
      },
    }));

    await ProductModel.bulkWrite(bulkUpdates);
    await CartModel.findByIdAndDelete(cartId);

    console.log('🗑️ Cart deleted (card):', cartId);
  } catch (err) {
    console.error('🔥 Error in createCardOrder:', err.message);
  }
};

/* =====================================================
   STRIPE WEBHOOK
===================================================== */
export const webhookCheckout = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log('✅ Webhook received:', event.type);
  } catch (err) {
    console.error('❌ Webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    await createCardOrder(event.data.object);
  }

  res.status(200).json({ received: true });
});

/* =====================================================
   OTHER HANDLERS
===================================================== */
export const filterOrderForLoggedUser = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'user') {
    req.filterObj = { user: req.user._id };
  }
  next();
});

export const findAllOrders = factory.getAll(OrderModel);
export const findSpecificOrder = factory.getOne(OrderModel);

export const updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await OrderModel.findById(req.params.id);
  if (!order) {
    return next(new ApiError(`No order found with ID: ${req.params.id}`, 404));
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  await order.save();

  res.status(200).json({ status: 'success', data: order });
});

export const updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const order = await OrderModel.findById(req.params.id);
  if (!order) {
    return next(new ApiError(`No order found with ID: ${req.params.id}`, 404));
  }

  order.isDelivered = true;
  order.deliveredAt = Date.now();
  await order.save();

  res.status(200).json({ status: 'success', data: order });
});

export const deleteOrder = asyncHandler(async (req, res, next) => {
  const order = await OrderModel.findById(req.params.id);
  if (!order) {
    return next(new ApiError(`No order found with ID: ${req.params.id}`, 404));
  }

  await OrderModel.findByIdAndDelete(req.params.id);
  res.status(204).json({ status: 'success' });
});
