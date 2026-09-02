const mongoose = require('mongoose');
const toJSONPlugin = require('./plugins/toJSON');

const deliveryLocationSchema = new mongoose.Schema({
  city: { type: String, required: true },
  state: { type: String, required: true },
  deliveryCharge: { type: Number, required: true },
  freeDeliveryAbove: { type: Number, required: true },
  estimatedDays: String,
  isActive: { type: Boolean, default: true }
});

deliveryLocationSchema.plugin(toJSONPlugin);

module.exports = mongoose.model('DeliveryLocation', deliveryLocationSchema);
