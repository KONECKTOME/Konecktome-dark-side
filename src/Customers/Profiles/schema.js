const { model, Schema } = require("mongoose");

const userProfile = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  phone: { type: Number },
  profession: { type: String },
  addressLine1: { type: String },
  addressLine2: { type: String },
  postCode: { type: String },
  imageUrl: { type: String },
  splitBillFamilyMembers: [
    {
      familyMemberId: { type: String },
      name: { type: String },
    },
  ],
  accounts: [
    {
      companyId: { type: String },
      serviceProviderName: { type: String },
      serviceType: { type: String },
      joinDate: { type: String },
      description: { type: String },
      price: { type: Number },
    },
  ],
  paymentDetails: [
    {
      cardNumber: { type: Number },
      expiryDate: { type: String },
      cvc: { type: Number },
      cardHolderName: { type: String },
    },
  ],
  billingAddress: [
    {
      firstName: { type: String },
      lastName: { type: String },
      addressLine1: { type: String },
      addressLine2: { type: String },
      postCode: { type: String },
    },
  ],
  transactionHistory: [
    {
      companyId: { type: String },
      serviceProviderName: { type: String },
      serviceType: { type: String },
      dateOfTransaction: { type: String },
      nextDueDate: { type: String },
      price: { type: Number },
      desc: { type: String },
    },
  ],
  wishlist: [
    {
      companyId: { type: String },
      serviceProviderName: { type: String },
      serviceType: { type: String },
      price: { type: Number },
      desc: { type: String },
    },
  ],
});

const usersProfileModel = model("Users", userProfile);

module.exports = usersProfileModel;
