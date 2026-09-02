const mongoose = require('mongoose');
const toJSONPlugin = require('./plugins/toJSON');
const { addressSchema } = require('./User');

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    image: String,
    price: Number,
    quantity: Number
  },
  { _id: true }
);
orderItemSchema.plugin(toJSONPlugin);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    deliveryLocationId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryLocation', required: true },
    shippingAddress: { type: addressSchema, required: true },
    itemsTotal: { type: Number, required: true },
    deliveryCharge: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['COD', 'CARD', 'UPI', 'NETBANKING'], required: true },
    paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING' },
    paymentId: { type: String, default: null },
    orderStatus: {
      type: String,
      enum: ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
      default: 'PLACED'
    }
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

orderSchema.plugin(toJSONPlugin);

module.exports = mongoose.model('Order', orderSchema);
