const { model, Schema } = require("mongoose");

const affiliateSchema = new Schema({
  brandName: { type: String, required: true },
  brandLogo: { type: String, required: true },
  brandUrl: { type: String, required: true },
  deals: [
    {
      promotions: [],
      title: { type: String, required: true },
      image: { type: String },
      price: { type: String, required: true },
      priceSubSection: { type: String },
      features: [],
      duration: { type: String },
    },
  ],
});

const affiliateModel = model("affiliate", affiliateSchema);

module.exports = affiliateModel;
