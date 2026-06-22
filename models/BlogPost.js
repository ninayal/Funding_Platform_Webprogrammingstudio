const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const blogPostSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  content:  { type: String, required: true },
  author:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  tags:     [{ type: String }],
  image:    { type: String, default: '/images/blog/default.jpg' },
  comments: [commentSchema],
}, { timestamps: true });

module.exports = mongoose.model('BlogPost', blogPostSchema);
