const mongoose = require('mongoose');
const toJSONPlugin = require('./plugins/toJSON');

// Embedded address (used inside User.addresses and Order.shippingAddress)
const addressSchema = new mongoose.Schema(
  {
    fullName: String,
    phone: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    isDefault: { type: Boolean, default: false }
  },
  { _id: true }
);
addressSchema.plugin(toJSONPlugin);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: { type: String, required: true },
    password: { type: String, required: true }, // bcrypt hash, never sent back unhashed
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    addresses: [addressSchema]
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

userSchema.plugin(toJSONPlugin);

module.exports = mongoose.model('User', userSchema);
module.exports.addressSchema = addressSchema;
