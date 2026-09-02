const mongoose = require('mongoose');
const toJSONPlugin = require('./plugins/toJSON');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  price: { type: Number, required: true },
  mrp: { type: Number, required: true },
  weight: String,
  isPopular: { type: Boolean, default: false },
  image: String,
  description: String,
  stock: { type: Number, default: 0 }
});

// Helpful for /api/products?search= and category filtering
productSchema.index({ name: 'text' });

productSchema.plugin(toJSONPlugin);

module.exports = mongoose.model('Product', productSchema);
