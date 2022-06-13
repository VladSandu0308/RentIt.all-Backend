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
  completed: Boolean


});

const Connection = mongoose.model("Connection", ConnectionSchema);

module.exports = Connection;