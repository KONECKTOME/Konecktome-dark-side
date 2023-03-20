const { model, Schema } = require("mongoose");

const affiliateSchema = new Schema({
  brandName: { type: String, required: true },
  brandDescription: { type: String, required: true },
  deals: [
    {
      brandId: { type: String, required: true },
      Brand: { type: String, required: true },
      Type: { type: String },
      Name: { type: String, required: true },
      Speed: { type: Number },
      Contract: { type: Number },
      Downloads: { type: String },
      Calls: { type: String },
      VAT: { type: String },
      Setup: { type: String },
      Price: { type: Number },
      Offers: { type: String },
      OfferPrice: { type: String },
      Benefits: [],
      url: { type: String },
      image: { type: String },
    },
  ],
});

const affiliateModel = model("brands", affiliateSchema);

module.exports = affiliateModel;
