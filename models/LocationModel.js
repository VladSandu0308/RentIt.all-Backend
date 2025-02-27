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
    String
  },
  activated: {
    Boolean
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
  }

});

const Location = mongoose.model("Location", LocationSchema);

module.exports = Location;