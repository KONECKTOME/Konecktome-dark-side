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
  changePasswordToken: { type: String, default: "000000" },
  stripeCustId: { type: String },
  phone: { type: Number },
  pin: { type: String, default: "0000" },
  profession: { type: String },
  dob: { type: String },
  age: { type: Number },
  imageUrl: { type: String },
  gender: { type: String },
  facebookId: { type: Number },
  meets3yearMargin: { type: Boolean },
  pinHasBeenSet: { type: Boolean, default: false },
  moreInfoNeeded: { type: Boolean, default: true },
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
      buildingName: { type: String },
      addressLine1: { type: String },
      addressLine2: { type: String },
      town: { type: String },
      city: { type: String },
      postCode: { type: String },
      currentAddress: { type: Boolean },
      deliveryAddress: { type: Boolean },
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
      installationDateAndTime: { type: String },
      status: { type: String, default: "Pending" },
      total: { type: Number },
      deliveryAddress: [
        {
          addressLine1: { type: String },
          addressLine2: { type: String },
          town: { type: String },
          city: { type: String },
          postCode: { type: String },
        },
      ],
      serviceProviderLogo: { type: String },
    },
  ],
  wishlist: [
    {
      companyId: { type: String },
      dealId: { type: String },
      companyImage: { type: String },
      dealName: { type: String },
      serviceProviderName: { type: String },
      tag: { type: String },
      price: { type: Number },
      description: { type: String },
    },
  ],
  feedback: [
    {
      date: { type: String },
      title: { type: String },
      message: { type: String },
    },
  ],
  notifications: [
    {
      message: { type: String },
      date: { type: String },
      messageStatus: { type: Boolean },
      title: { type: String },
    },
  ],
});

userProfile.statics.findByCredentials = async (email, password) => {
  const user = await usersProfileModel.findOne({ email });
  const isMatch = await bcrypt.compare(password, user.password);
  if (isMatch) {
    return user;
  }
};

userProfile.statics.findPinByCredentials = async (email, pin) => {
  const user = await usersProfileModel.findOne({ email });
  const isMatch = await bcrypt.compare(pin, user.pin);
  if (isMatch) {
    return user;
  }
};
userProfile.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  if (user.isModified("pin")) {
    user.pin = await bcrypt.hash(user.pin, 8);
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
