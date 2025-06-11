const mongoose = require("mongoose");

const LocationSchema = new mongoose.Schema({
  host_email: {
    type: String,
    required: true,
  },
  title: {
    type: String
  },
  description: {
    type: String
  },
  furnished: {
    type: String
  },
  location: {
    type: String
  },
  mode: {
    type: String
  },
  coords: {
    type: [Number]
  },
  adults: {
    type: Number
  },
  kids: {
    type: Number
  },
  baths: {
    type: Number
  },
  rooms: {
    type: Number
  },
  size: {
    type: Number
  },
  price: {
    type: Number
  },
  cerere: {
    type: String
  },
  activated: {
    type: Boolean
  },
  review_count: {
    type: Number
  },
  grade: {
    type: Number
  },
  facilities: {
    AC: Boolean,
    balcony: Boolean,
    bathroom: Boolean,
    bbq: Boolean,
    bedroom: Boolean,
    garden: Boolean,
    heat: Boolean,
    'hot tub': Boolean,
    kitchen: Boolean,
    parking: Boolean,
    pets: Boolean,
    pool: Boolean,
    sports: Boolean,
    wash: Boolean,
    wifi: Boolean,
  },

  cover: {
    type: String
  },
  img2: {
    type: String
  },
  img3: {
    type: String
  },
  img4: {
    type: String
  },
  img5: {
    type: String
  },
  unavailableDates: {
    type: [{
      from: Date,
      to: Date
    }],
    default: [{
      from: 2022-06-12,
      to: 2022-06-17
    }]
  },

  total_bookings: {
    type: Number,
    default: 0
  },
  total_revenue_generated: {
    type: Number,
    default: 0
  },
  total_nights_booked: {
    type: Number,
    default: 0
  },
  
  // Timestamps
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
LocationSchema.index({ host_email: 1 });
LocationSchema.index({ mode: 1 });
LocationSchema.index({ coords: '2dsphere' }); // Pentru geolocation queries

const Location = mongoose.model("Location", LocationSchema);

module.exports = Location;