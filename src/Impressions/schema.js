const { model, Schema } = require("mongoose");

const impressionSchema = new Schema({
  landingPage: { type: Number, default: 0 },
  explorePage: { type: Number, default: 0 },
  articles: { type: Number, default: 0 },
});

const impressionsModel = model("impressions", impressionSchema);

module.exports = impressionsModel;
