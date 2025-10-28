import mongoose, { Schema } from 'mongoose';

// 🧾 Order Schema
const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Order must belong to a user'],
    },

    cartItems: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: [true, 'Order item must reference a product'],
        },
        quantity: {
          type: Number,
          required: [true, 'Order item must have a quantity'],
          min: [1, 'Quantity must be at least 1'],
        },
        color: {
          type: String,
          trim: true,
        },
        price: {
          type: Number,
          required: [true, 'Order item must have a price'],
          min: [0, 'Price must be positive'],
        },
      },
    ],

    taxPrice: {
      type: Number,
      default: 0,
      min: [0, 'Tax price cannot be negative'],
    },

    shippingAddress: {
      details: {
        type: String,
        required: [true, 'Shipping address details are required'],
      },
      phone: {
        type: String,
        required: [true, 'Phone number for shipping is required'],
      },
      city: {
        type: String,
        required: [true, 'City is required for shipping'],
      },
      postalCode: {
        type: String,
        required: [true, 'Postal code is required'],
      },
    },

    shippingPrice: {
      type: Number,
      default: 0,
      min: [0, 'Shipping price cannot be negative'],
    },

    totalOrderPrice: {
      type: Number,
      required: [true, 'Total order price is required'],
      min: [0, 'Total price must be positive'],
    },

    paymentMethodType: {
      type: String,
      enum: ['card', 'cash'],
      default: 'cash',
    },

    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,

    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
  },
  { timestamps: true }
);

// 🔄 Auto-populate user & products when fetching orders
orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name email phone profileImg',
  }).populate({
    path: 'cartItems.product',
    select: 'title imageCover price',
  });

  next();
});

const OrderModel = mongoose.model('Order', orderSchema);

export default OrderModel;
