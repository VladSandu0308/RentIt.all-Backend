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
  },

  receipt_url: {
    type: String,
    default: null
  }, // Firebase URL for the receipt PDF


   // ADD THESE NEW INVOICE FIELDS:
  invoice_status: {
    type: String,
    enum: ['none', 'requested', 'processing', 'generated'],
    default: 'none'
  },
  invoice_details: {
    company_name: String,
    cui: String,
    reg_com: String,
    address: String,
    bank_name: String,
    bank_account: String,
    contact_person: String,
    contact_email: String,
    contact_phone: String,
    notes: String
  },
  invoice_file_url: String, // Firebase URL for the invoice PDF
  invoice_number: String,
  invoice_date: Date,
  invoice_method: {
    type: String,
    enum: ['manual', 'rentit'],
    default: null
  },
  invoice_requested_at: Date,
  invoice_generated_at: Date,


});

// Index pentru performanță
ConnectionSchema.index({ user_id: 1 });
ConnectionSchema.index({ location_id: 1 });
ConnectionSchema.index({ status: 1 });
ConnectionSchema.index({ completed: 1 });


const Connection = mongoose.model("Connection", ConnectionSchema);

module.exports = Connection;