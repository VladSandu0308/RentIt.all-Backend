// models/EventModel.js
const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  coordinates: {
    type: [Number], // [longitude, latitude] pentru Mapbox
    default: null,
  },
  start_date: {
    type: Date,
    required: true,
  },
  end_date: {
    type: Date,
    required: true,
  },
  organizer: {
    type: String,
    default: "Autorități locale",
  },
  cover_image: {
    type: String,
    default: null,
  },
  is_free: {
    type: Boolean,
    default: true,
  },
  created_by: {
    type: String,
    default: "minister@rentit.all",
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'completed'],
    default: 'active'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const Event = mongoose.model("Event", EventSchema);
module.exports = Event;