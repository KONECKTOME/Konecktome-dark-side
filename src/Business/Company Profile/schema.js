const { model, Schema } = require("mongoose");

const companyProfile = new Schema({
  companyName: { type: String, required: true },
  companyLogo: { type: String },
  companyDescription: { type: String, required: true },
  companyContactDetails: [
    {
      addressLine1: { type: String, required: true },
      addressLine2: { type: String, required: true },
      postCode: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      email: { type: String, required: true },
    },
  ],
  companyPOC: [
    {
      pocFirstName: { type: String },
      pocLastName: { type: String },
      pocPhone: { type: String },
      pocEmail: { type: String },
    },
  ],
  deals: [
    {
      dealName: { type: String },
      dealPrice: { type: String },
      speed: { type: String },
      subTitle: { type: String },
      dealContractPlans: [
        {
          setUpFee: { type: String },
          contractDuration: { type: String },
        },
      ],
      features: [],
    },
  ],
});

const companyProfileModel = model("company-profile", companyProfile);

module.exports = companyProfileModel;
