// models/PaymentModel.js - MODEL COMPLET NOU
const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  connection_id: {
    type: String,
    required: true,
    ref: 'Connection'
  },
  user_id: {
    type: String,
    required: true,
    ref: 'User'
  },
  host_id: {
    type: String,
    required: true,
    ref: 'User'
  },
  location_id: {
    type: String,
    required: true,
    ref: 'Location'
  },
  stripe_payment_intent_id: {
    type: String,
    required: true,
    unique: true
  },
  total_amount: {
    type: Number,
    required: true
  },
  host_amount: {
    type: Number,
    required: true
  },
  platform_commission: {
    type: Number,
    required: true
  },
  government_tax: {
    type: Number,
    required: true
  },
  commission_rate: {
    type: Number,
    default: 0.10 // 10% comision platformă
  },
  tax_rate: {
    type: Number,
    default: 0.05 // 5% taxă guvernamentală
  },
  currency: {
    type: String,
    default: 'ron'
  },
  status: {
    type: String,
    enum: ['pending', 'succeeded', 'failed', 'cancelled', 'requires_payment_method'],
    default: 'pending'
  },
  payment_method: {
    type: String,
    default: 'card'
  },
  nights: {
    type: Number,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Index pentru căutări rapide
PaymentSchema.index({ connection_id: 1 });
PaymentSchema.index({ user_id: 1 });
PaymentSchema.index({ host_id: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ created_at: -1 });

const Payment = mongoose.model("Payment", PaymentSchema);

module.exports = Payment;