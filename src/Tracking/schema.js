const { model, Schema } = require("mongoose");

const trackingSchema = new Schema({
  brandName: { type: String, required: true },
  brandId: { type: String },
  clicks: { type: Number, required: true, default: 0 },
});

const trackingModel = model("tracking", trackingSchema);

module.exports = trackingModel;
