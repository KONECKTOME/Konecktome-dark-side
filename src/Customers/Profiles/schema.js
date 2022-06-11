const { model, Schema } = require("mongoose");
const bcrypt = require("bcryptjs");

const userProfile = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: {
    type: String,
  },
  password: {
    type: String,
    // required: true,
    minlength: 7,
  },
  changePasswordToken: { type: String },
  stripeCustId: { type: String },
  phone: { type: Number },
  profession: { type: String },
  dob: { type: String },
  age: { type: Number },
  imageUrl: { type: String },
  gender: { type: String },
  facebookId: { type: Number },
  meets3yearMargin: { type: Boolean },
  splitBillFamilyMembers: [
    {
      groupingByService: [
        {
          serviceProviderID: { type: String },
          serviceName: { type: String },
          serviceProviderName: { type: String },
          totalPrice: { type: Number },
          pricePerFamilyMember: { type: Number },
          familyMembers: [
            {
              familyMemberId: { type: String },
              familyMemberName: { type: String },
            },
          ],
        },
      ],
    },
  ],
  accounts: [
    {
      companyId: { type: String },
      companyImage: { type: String },
      dealName: { type: String },
      serviceProviderName: { type: String },
      tag: { type: String },
      joinDate: { type: String },
      description: { type: String },
      price: { type: Number },
    },
  ],
  reviews: [
    {
      companyId: { type: String },
      serviceProviderName: { type: String },
      rating: { type: Number },
      comment: { type: String },
    },
  ],
  addressHistory: [
    {
      addressLine1: { type: String },
      addressLine2: { type: String },
      postCode: { type: String },
      currentAddress: { type: Boolean },
      dateOfArrival: { type: String },
      dateOfDeparture: { type: String },
      durationOfStay: { type: String },
      durationOfStayInMonths: { type: String },
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
      dealName: { type: String },
      dateOfTransaction: { type: String },
      timeOfTransaction: { type: String },
      nextDueDate: { type: String },
      subscriptionPrice: { type: Number },
      oneOffPrice: { type: Number },
      description: { type: String },
    },
  ],
  wishlist: [
    {
      companyId: { type: String },
      dealId: { type: String },
      companyImage: { type: String },
      dealName: { type: String },
      serviceProviderName: { type: String },
      serviceType: { type: String },
      price: { type: Number },
      description: { type: String },
    },
  ],
  notifications: [
    {
      message: { type: String },
      date: { type: String },
      messageStatus: { type: Boolean },
      title: { type: Number },
    },
  ],
});

userProfile.statics.findByCredentials = async (email, password) => {
  const user = await usersProfileModel.findOne({ email });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error("Unable to login");
    err.httpStatusCode = 401;
    throw err;
  }
  return user;
};
userProfile.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});
userProfile.post("validate", function (error, doc, next) {
  if (error) {
    error.httpStatusCode = 400;
    next(error);
  } else {
    next();
  }
});

userProfile.post("save", function (error, doc, next) {
  if (error.name === "MongoError" && error.code === 11000) {
    error.httpStatusCode = 400;
    next(error);
  } else {
    next();
  }
});

const usersProfileModel = model("Users", userProfile);

module.exports = usersProfileModel;
