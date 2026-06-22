const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name:     String,
  price:    Number,
  quantity: { type: Number, min: 1 },
  image:    String,
});

const orderSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items:    [orderItemSchema],
  delivery: {
    firstName: String, lastName: String,
    address: String, city: String, country: String,
  },
  total:    { type: Number, required: true },
  status:   { type: String, enum: ['pending','processing','shipped','delivered'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
