import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const cartSchema = new Schema(
  {
    cartItems: [
      {
        product: {
          //parent reference
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: [true, 'Cart item must have a product reference'],
        },
        quantity: {
          type: Number,
          default: 1,
          min: [1, 'Quantity must be at least 1'],
        },
        color: {
          type: String,
          trim: true,
        },
        price: {
          type: Number,
          required: [true, 'Cart item must have a price'],
        },
      },
    ],
    totalCartPrice: {
      type: Number,
      min: [0, 'Total cart price cannot be negative'],
    },
    totalPriceAfterDiscount: {
      type: Number,
      min: [0, 'Discounted price cannot be negative'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Cart must belong to a user'],
    },
  },
  { timestamps: true }
);

const CartModel = mongoose.model('Cart', cartSchema);
export default CartModel;
