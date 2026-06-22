const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  rating:      { type: Number, required: true, min: 1, max: 5 },
  reviewer:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product:     { type: String },
  image:       { type: String, default: '/images/reviews/default.jpg' },
  isDeleted:   { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
