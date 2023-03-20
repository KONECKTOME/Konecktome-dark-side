const { model, Schema } = require("mongoose");

const articleSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  paragraphs: [],
  date: {
    type: Date,
    default: Date.now,
  },
});

const articleModel = model("articles", articleSchema);

module.exports = articleModel;
