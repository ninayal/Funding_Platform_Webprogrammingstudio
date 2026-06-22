const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String, required: true },
  price:       { type: Number, required: true, min: 0 },
  category:    { type: String, required: true },
  image:       { type: String, default: '/images/products/default.jpg' },
  stock:       { type: Number, default: 0, min: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
