const mongoose = require("mongoose");

const ConnectionSchema = new mongoose.Schema({
  location_id: String,
  user_id: String,
  from: Date,
  to: Date,
  status: {
    type: String,
    default: "Client request",
    enum: [
      "Client request",
      "Request accepted by host",
      "Request accepted by host - Awaiting payment", 
      "Accepted - Payment in progress",                 
      "Payment completed - Booking confirmed",          
      "Request accepted by host - Payment failed",      
      "Request rejected by host",
      "Request rejected because of conflict"
    ]
  },
  completed: Boolean,
  reviewed_user: {
    type: Boolean,
    default: false
  },
  reviewed_location: {
    type: Boolean,
    default: false
  },

  payment_id: {
    type: String,
    ref: 'Payment',
    default: null
  },
  total_amount: {
    type: Number,
    default: 0
  },
  host_email: String,        // Pentru ușurința în căutări
  location_title: String,    // Pentru afișare rapidă

  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }


});

// Index pentru performanță
ConnectionSchema.index({ user_id: 1 });
ConnectionSchema.index({ location_id: 1 });
ConnectionSchema.index({ status: 1 });
ConnectionSchema.index({ completed: 1 });


const Connection = mongoose.model("Connection", ConnectionSchema);

module.exports = Connection;