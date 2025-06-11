const mongoose = require("mongoose");

const PermitSchema = new mongoose.Schema({
  location_id: {
    type: String,
    required: true,
    ref: 'Location'
  },
  permit_type: {
    type: String,
    required: true,
    enum: [
      'businessLicense',
      'shortTermRental', 
      'mountainTourism',
      'ecotourism',
      'culturalHeritage',
      'ruralTourism'
    ]
  },
  document_url: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  permit_number: {
    type: String,
    default: null
  },
  issued_date: {
    type: Date,
    default: null
  },
  expiry_date: {
    type: Date,
    default: null
  },
  rejection_reason: {
    type: String,
    default: null
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

// Index pentru performanță
PermitSchema.index({ location_id: 1 });
PermitSchema.index({ status: 1 });

const Permit = mongoose.model("Permit", PermitSchema);

module.exports = Permit;