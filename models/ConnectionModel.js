const mongoose = require("mongoose");

const ConnectionSchema = new mongoose.Schema({
  location_id: String,
  user_id: String,
  from: Date,
  to: Date,
  status: {
    type: String,
    default: "Client request"
  },
  completed: Boolean,
  reviewed_user: {
    type: Boolean,
    default: false
  },
  reviewed_location: {
    type: Boolean,
    default: false
  }


});

const Connection = mongoose.model("Connection", ConnectionSchema);

module.exports = Connection;