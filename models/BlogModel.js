const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema({
  cover: String,
  body: String,
  title: String,
});

const Blog = mongoose.model("Blog", BlogSchema);

module.exports = Blog;