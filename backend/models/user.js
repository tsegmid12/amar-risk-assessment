const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['superadmin', 'admin'],
    default: 'admin'
  },
  verificationCode: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCodeExpires: {
    type: Date,
    default: null
  },
  resetPasswordCode:{
    type: String,
    default: null
  },
  resetPasswordVerified:{
    type: Boolean,
    default: false
  },
  resetPasswordCodeExpires:{
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);