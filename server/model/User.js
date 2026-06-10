const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'student'],
    default: 'student',
  },
  profileImage: {
    type: String,
    default: null,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  plan: {
    type: String,
    default: 'Free',
  },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
