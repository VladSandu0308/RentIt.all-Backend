const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  first_name: {
    type: String
  },
  last_name: {
    type: String
  },
  phone: {
    type: Number
  },
  profile: {
    type: String
  },
  personal_info: {
    type: String
  },
  interests: {
    type: String
  },
  purpose: {
    type: String
  },
  review_count: {
    type: Number,
    default: 0
  },
  grade: {
    type: Number,
    default: 0
  },
  
  total_earnings: {
    type: Number,
    default: 0
  },
  total_bookings_hosted: {
    type: Number,
    default: 0
  },
  total_bookings_made: {
    type: Number,
    default: 0
  },
  
  // Timestamps
  created_at: {
    type: Date,
    default: Date.now
  },
  last_login: {
    type: Date,
    default: Date.now
  }



});

const User = mongoose.model("User", UserSchema);

module.exports = User;