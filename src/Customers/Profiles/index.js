const router = require("express").Router();
const usersModel = require("./schema");
const {
  refreshToken,
  generateToken,
} = require("../../Services/OAuth/authTools");
const { authorize } = require("../../Services/Middlewares/authorize");
const passport = require("passport");
require("../../Services/OAuth/googleAuth")(passport);
require("../../Services/OAuth/FacebookAuth")(passport);
const multer = require("../../Services/Cloudinary/multer");
const cloudinary = require("../../Services/Cloudinary/cloudinary");
const moment = require("moment");

router.get("/", async (req, res) => {
  try {
    const allUsers = await usersModel.find();
    res.send(allUsers).status(200);
  } catch (error) {
    console.log(error);
  }
});
// -----  LOGIN AND SIGN UP ------ //
router.post("/sign-up", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const user = await usersModel.find({ email: email });
    if (user.length > 0) {
      res.json({
        message: "Email already exists",
      });
    } else {
      const newUser = await usersModel.create({
        firstName,
        lastName,
        email,
        password,
      });
      res.status(201).send(newUser._id);
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await usersModel.findByCredentials(email, password);

    const tokens = await generateToken(user);
    if (user) {
      res.setHeader("Content-Type", "application/json");
      res.send(tokens);
    }
  } catch (error) {
    console.log(error);
  }
});

router.get("/get-user-after-login", authorize, async (req, res, next) => {
  try {
  } catch (error) {
    console.log(error);
  }
});

// ----- END OF LOGIN AND SIGN UP ------ //

// ----- DOB, PROFESSION, AGE, PHONE, GENDER ------ //

router.post("/update-dob-profession", async (req, res) => {
  try {
    const { userId, dob, profession, phone, gender } = req.body;
    let dateOfBirth = dob.split("-").reverse();
    let dateOfBirthInArray = [];
    let currDateInArr = [];
    dateOfBirth.forEach((str) => {
      return dateOfBirthInArray.push(Number(str));
    });

    let currDate = new Date().toLocaleDateString().split("/").reverse();
    currDate.forEach((str) => {
      return currDateInArr.push(Number(str));
    });

    let differenceInDates = moment(currDateInArr).diff(
      moment(dateOfBirthInArray),
      "months"
    );
    let age = differenceInDates / 12;
    let findUser = await usersModel.findOneAndUpdate(
      { _id: userId },
      {
        userId,
        dob,
        profession,
        phone,
        gender,
        age: parseInt(age),
      }
    );
    if (findUser) {
      res.json({
        message: "User profession and co updated!",
      });
    } else {
      res.json({
        message: "ERROR!",
      });
    }
  } catch (error) {
    console.log(error);
  }
});

// -----END OF DOB, PROFESSION, AGE, PHONE, GENDER ------ //

// ----- ADDRESS AND THREE YEAR MARGIN ------ //
router.post("/update-address", async (req, res) => {
  try {
    let {
      userId,
      addressLine1,
      addressLine2,
      currentAddress,
      postCode,
      dateOfArrival,
      dateOfDeparture,
    } = req.body;
    let findUser = await usersModel.findById(userId);
    if (findUser) {
      let itemIndex = findUser.addressHistory.findIndex(
        (p) => p.addressLine1 === addressLine1
      );
      if (itemIndex > -1) {
        res.json({
          message: "Address already exists",
        });
      } else {
        let allExistingDurationInMonths = "";
        if (findUser.addressHistory.length === 0) {
          let durationOfStay = "";
          let dateOfArrivalInArray = [];
          let dateOfDepartureInArray = [];
          let dateOfArrivalInString = dateOfArrival.split("-");
          let dateOfDepartureInString = dateOfDeparture.split("-");
          dateOfArrivalInString.reverse().forEach((str) => {
            dateOfArrivalInArray.push(Number(str));
          });
          dateOfDepartureInString.reverse().forEach((str) => {
            dateOfDepartureInArray.push(Number(str));
          });
          let differenceInDates = moment(dateOfDepartureInArray).diff(
            moment(dateOfArrivalInArray),
            "months"
          );

          if (differenceInDates > 12) {
            let numberOfYears = differenceInDates / 12;
            let numberOfYearsSplit = numberOfYears.toString().split(".")[0];
            let numberOfMonths =
              Number(numberOfYears.toString().split(".")[1].split("")[0]) + 1;
            durationOfStay =
              numberOfYearsSplit +
              " " +
              "year(s)" +
              " " +
              numberOfMonths +
              " " +
              "month(s)";
          } else {
            durationOfStay = differenceInDates + " " + "month(s)";
          }
          if (Number(differenceInDates) > 36) {
            await usersModel.findOneAndUpdate(
              { _id: userId },
              {
                meets3yearMargin: true,
              }
            );
            findUser.addressHistory.push({
              addressLine1,
              addressLine2,
              postCode,
              currentAddress,
              dateOfArrival,
              dateOfDeparture,
              durationOfStay,
              durationOfStayInMonths: differenceInDates,
            });
            findUser = await findUser.save();
            res.json({
              message: "Address added ",
            });
          } else {
            findUser.addressHistory.push({
              addressLine1,
              addressLine2,
              postCode,
              currentAddress,
              dateOfArrival,
              dateOfDeparture,
              durationOfStay,
              durationOfStayInMonths: differenceInDates,
            });
            findUser = await findUser.save();
            res.json({
              message: "Address added ",
            });
          }
        } else {
          allExistingDurationInMonths = findUser.addressHistory
            .map((item) => parseInt(item.durationOfStayInMonths))
            .reduce((acc, next) => acc + next);
          let durationOfStay = "";
          let dateOfArrivalInArray = [];
          let dateOfDepartureInArray = [];
          let dateOfArrivalInString = dateOfArrival.split("-");
          let dateOfDepartureInString = dateOfDeparture.split("-");
          dateOfArrivalInString.reverse().forEach((str) => {
            dateOfArrivalInArray.push(Number(str));
          });
          dateOfDepartureInString.reverse().forEach((str) => {
            dateOfDepartureInArray.push(Number(str));
          });
          let differenceInDates = moment(dateOfDepartureInArray).diff(
            moment(dateOfArrivalInArray),
            "months"
          );
          let addDurationOfStayInMonths =
            allExistingDurationInMonths + differenceInDates;
          console.log(addDurationOfStayInMonths);

          if (differenceInDates > 12) {
            let numberOfYears = differenceInDates / 12;
            let numberOfYearsSplit = numberOfYears.toString().split(".")[0];
            let numberOfMonths =
              Number(numberOfYears.toString().split(".")[1].split("")[0]) + 1;
            durationOfStay =
              numberOfYearsSplit +
              " " +
              "year(s)" +
              " " +
              numberOfMonths +
              " " +
              "month(s)";
          } else {
            durationOfStay = differenceInDates + " " + "month(s)";
          }
          if (addDurationOfStayInMonths >= 36) {
            await usersModel.findOneAndUpdate(
              { _id: userId },
              {
                meets3yearMargin: true,
              }
            );
            findUser.addressHistory.push({
              addressLine1,
              addressLine2,
              postCode,
              currentAddress,
              dateOfArrival,
              dateOfDeparture,
              durationOfStay,
              durationOfStayInMonths: differenceInDates,
            });
            findUser = await findUser.save();
            res.json({
              message: "Address added ",
            });
          } else {
            findUser.addressHistory.push({
              addressLine1,
              addressLine2,
              postCode,
              currentAddress,
              dateOfArrival,
              dateOfDeparture,
              durationOfStay,
              durationOfStayInMonths: differenceInDates,
            });
            findUser = await findUser.save();
            res.json({
              message: "Address added ",
            });
          }
        }
      }
    } else {
      res.json({
        message: "User not found",
      });
    }
  } catch (error) {
    console.log(error);
  }
});

// ----- END OF ADDRESS AND THREE YEAR MARGIN ------ //

// ----- UPDATE ACCOUNTS ------ //
router.post("/update-accounts", async (req, res) => {
  try {
    const {
      userId,
      serviceProviderName,
      companyId,
      serviceType,
      joinDate,
      price,
      description,
    } = req.body;
    let findUser = await usersModel.findById(userId);
    if (findUser) {
      let itemIndex = findUser.accounts.findIndex(
        (p) => p.serviceProviderName === serviceProviderName
      );
      if (itemIndex > -1) {
        let accountItem = findUser.accounts[itemIndex];
        if (accountItem.companyId === companyId) {
          accountItem.serviceProviderName = serviceProviderName;
          accountItem.serviceType = serviceType;
          accountItem.joinDate = joinDate;
          accountItem.description = description;
          accountItem.price = price;
        } else {
          findUser.accounts.push({
            companyId,
            serviceProviderName,
            serviceType,
            joinDate,
            description,
            price,
          });
        }
        findUser = await findUser.save();
        res.json({
          message: "New account added for user",
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
});

// ----- END OF UPDATE ACCOUNTS ------ //

// ----- CARD DETAILS ------ //

router.post("/add-new-card-details", async (req, res) => {
  try {
    const { userId, cardNumber, expiryDate, cvc, cardHolderName, cardId } =
      req.body;
    let findUser = await usersModel.findById(userId);
    if (findUser) {
      if (findUser.paymentDetails.length !== 0) {
        const filter = findUser.paymentDetails.filter(
          (p) => JSON.stringify(p._id) === JSON.stringify(cardId)
        );
        let itemIndex = findUser.paymentDetails.findIndex(
          (p) => JSON.stringify(p._id) === JSON.stringify(cardId)
        );
        // console.log(itemIndex);
        if (itemIndex > -1) {
          let cardItem = findUser.paymentDetails[itemIndex];
          cardItem.cardNumber = cardNumber;
          cardItem.expiryDate = expiryDate;
          cardItem.cvc = cvc;
          cardItem.expiryDate = expiryDate;
          cardItem.cardHolderName = cardHolderName;
          findUser = await findUser.save();
          res.json({
            message: "Card updated",
          });
        } else {
          findUser.paymentDetails.push({
            cardNumber,
            expiryDate,
            cvc,
            cardHolderName,
          });
          findUser = await findUser.save();
          res.json({
            message: "New card added for user",
          });
        }
      } else {
        findUser.paymentDetails.push({
          cardNumber,
          expiryDate,
          cvc,
          cardHolderName,
        });
        findUser = await findUser.save();
        res.json({
          message: "New card added for user",
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
});

// ----- END OF CARD DETAILS ------ //

// ----- WISHLIST ------ //

router.post("/update-wishlist", async (req, res) => {
  try {
    const {
      userId,
      companyId,
      serviceProviderName,
      serviceType,
      price,
      description,
    } = req.body;
    let findUser = await usersModel.findById(userId);
    if (findUser) {
      findUser.wishlist.push({
        companyId,
        serviceProviderName,
        serviceType,
        price,
        description,
      });
      findUser = await findUser.save();
      res.json({
        message: "New wishlist added for user",
      });
    }
  } catch (error) {
    console.log(error);
  }
});

// ----- END OF WISHLIST ------ //

// ----- REVIEWS ------ //
router.post("/update-reviews", async (req, res) => {
  try {
    const { userId, companyId, serviceProviderName, rating, comment } =
      req.body;
    let findUser = await usersModel.findById(userId);
    if (findUser) {
      findUser.reviews.push({
        companyId,
        serviceProviderName,
        rating,
        comment,
      });
      findUser = await findUser.save();
      res.json({
        message: "New review added for user",
      });
    }
  } catch (error) {
    console.log(error);
  }
});

// ----- END OF REVIEWS ------ //
// ----- SPLIT BILL ------ //
router.post("/update-family-members", async (req, res) => {
  try {
    const {
      userId,
      familyMemberId,
      familyMemberName,
      serviceProviderID,
      serviceName,
      serviceProviderName,
      totalPrice,
    } = req.body;
    let findUser = await usersModel.findById(userId);
    console.log(findUser.splitBillFamilyMembers.groupingByService);
    if (findUser) {
      if (
        findUser.splitBillFamilyMembers.length === 0 ||
        serviceName !==
          findUser.splitBillFamilyMembers.groupingByService.serviceName
      ) {
        const pricePerFamilyMember = totalPrice / 2;
        findUser.splitBillFamilyMembers.push({
          groupingByService: [
            {
              serviceProviderID,
              serviceName,
              serviceProviderName,
              totalPrice,
              pricePerFamilyMember,
              familyMembers: [
                {
                  familyMemberId,
                  familyMemberName,
                },
              ],
            },
          ],
        });
        findUser = await findUser.save();
        res.json({
          message: "New family member added for user",
        });
      } else {
        if (
          serviceName ===
          findUser.splitBillFamilyMembers.groupingByService.serviceName
        ) {
          findUser.splitBillFamilyMembers.groupingByService.push({
            familyMembers: [
              {
                familyMemberId,
                familyMemberName,
              },
            ],
          });
          let itemIndex = findUser.splitBillFamilyMembers.groupingByService(
            (p) => p.serviceName === serviceName
          );
          let serviceItem =
            findUser.splitBillFamilyMembers.groupingByService[itemIndex];
          serviceItem.pricePerFamilyMember =
            serviceItem.totalPrice /
            findUser.splitBillFamilyMembers.groupingByService.familyMembers
              .length;
        }
        findUser = await findUser.save();
        res.json({
          message: "New family member added for user",
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
});

// -----END OF  SPLIT BILL ------ //

// ----- OAUTHS ------ //

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/fail",
  }),
  (req, res) => {
    res.redirect("/users/success");
  }
);

router.get("/success", (req, res) => {
  console.log(extractProfile);
});
router.get("/fail", (req, res) => {
  res.send("fail");
});

router.get("/auth/facebook", passport.authenticate("facebook"));

router.get(
  "/login/facebook",
  passport.authenticate("facebook", {
    scope: ["email", "profile"],
  })
);

router.get(
  "/oauth2/redirect/facebook",
  passport.authenticate("facebook", {
    failureRedirect: "/facebook-fail",
    failureMessage: true,
  }),
  function (req, res) {
    res.redirect("/users/facebook-success");
  }
);

router.get("/facebook-fail", async (req, res) => {
  console.log("failed facebook");
});

router.get("/facebook-success", async (req, res) => {
  console.log("success facebook");
});

// ----- END OF OAUTHS ------ //

// ----- IMAGE UPLOAD ------ //

router.post("/image-upload", multer.single("image"), async (req, res) => {
  try {
    const { userId } = req.body;
    const result = await cloudinary.uploads(req.file.path);
    if (result) {
      const updateImage = await usersModel.findByIdAndUpdate(
        { _id: userId },
        { imageUrl: result.url }
      );
      res.json({
        message: "Image added successfully",
      });
    } else {
      res.json({
        message: "An error occured while uploading image",
      });
    }
  } catch (error) {
    console.log(error);
  }
});

// ----- END IMAGE UPLOAD ------ //

// ----- TRANSACTION HISTORY ------ //
router.post("/update-transaction-history", async (req, res) => {
  try {
    const { userId, message, date, messageStatus, title } = req.body;
    let findUser = await usersModel.findById(userId);
    if (findUser) {
      findUser.notifications.push({
        message,
        date,
        messageStatus,
        title,
      });
      findUser = await findUser.save();
      res.json({
        message: "New notification added for user",
      });
    }
  } catch (error) {
    console.log(error);
  }
});
// ----- END OF TRANSACTION HISTORY ------ //

// ----- NOTIFICATION ------ //
router.get("/test-crawler", async (req, res) => {
  try {
    const { url } = req.body;
    const channelData = await crawler.scrapeChannel(url);
    res.send(channelData);
  } catch (error) {
    console.log(error);
  }
});

// ----- END OF NOTIFICATION ------ //

module.exports = router;
