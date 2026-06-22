const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username:  { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true },
  role:      { type: String, enum: ['user','admin'], default: 'user' },
  bio:       { type: String, default: '', maxlength: 300 },
  avatar:    { type: String, default: '/images/avatar-default.png' },
  isLocked:  { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
