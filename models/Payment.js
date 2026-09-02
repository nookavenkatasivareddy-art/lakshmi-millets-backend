const mongoose = require('mongoose');
const toJSONPlugin = require('./plugins/toJSON');

const paymentSchema = new mongoose.Schema(
  {
    gatewayOrderId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['CARD', 'UPI', 'NETBANKING'], required: true },
    status: { type: String, enum: ['CREATED', 'PAID', 'FAILED'], default: 'CREATED' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

paymentSchema.plugin(toJSONPlugin);

module.exports = mongoose.model('Payment', paymentSchema);
