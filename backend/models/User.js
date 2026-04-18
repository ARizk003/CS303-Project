const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["admin", "student"],
    default: "student"
  },

  date: {
    type: Date,
    default: Date.now
  },

  // ahmad: user_list relationship is handled in List.js, no need for lists attribute

  resetOtp: {
    type: String,
    default: null
  },

  resetOtpExpire: {
    type: Date,
    default: null
  },

  otpAttempts: {
    type: Number,
    default: 0
  },

  lastOtpSentAt: {
    type: Date,
    default: null
  }

});

module.exports = mongoose.model("User", UserSchema);