const { model, Schema } = require("mongoose");

const paymentProfile = new Schema({
  productName: { type: String, required: true },
  stripeProductId: { type: String, required: true },
});

const paymentProfileModel = model("payments", paymentProfile);

module.exports = paymentProfileModel;
