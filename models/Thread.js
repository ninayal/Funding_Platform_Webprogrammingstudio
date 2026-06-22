const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  content:   { type: String, required: true },
  author:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  image:     { type: String },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

const threadSchema = new mongoose.Schema({
  title:      { type: String, required: true, maxlength: 200 },
  content:    { type: String, required: true },
  author:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  image:      { type: String },
  isArchived: { type: Boolean, default: false },
  replies:    [replySchema],
}, { timestamps: true });

module.exports = mongoose.model('Thread', threadSchema);
