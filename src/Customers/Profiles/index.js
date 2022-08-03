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
const validator = require("../../Services/Validators/validator");
const bcrypt = require("bcryptjs");

router.get("/", async (req, res) => {
  try {
    const allUsers = await usersModel.find();
    res.send(allUsers).status(200);
  } catch (error) {
    console.log(error);
  }
});

router.get("/get-user-by-id/:userId", async (req, res) => {
  try {
    const allUsers = await usersModel.findById(req.params.userId);
    res.send(allUsers).status(200);
  } catch (error) {
    console.log(error);
  }
});
// -----  LOGIN,SIGN UP, EDIT USER DETAILS ------ //
router.put("/edit-user", async (req, res) => {
  try {
    const { userId, firstName, lastName, email } = req.body;

    let findUser = await usersModel.findById(userId);
    if (findUser) {
      if (validator.isValidEmail(email) === false) {
        res.json({
          message: "Invalid email",
        });
      } else {
        let updateUser = await usersModel.findOneAndUpdate(
          { _id: userId },
          {
            firstName,
            lastName,
            email,
          },
          {
            returnNewDocument: true,
          },
          function (err, result) {}
        );
        updateUser = await updateUser.save();
        if (updateUser) {
          res.json({
            message: "User updated",
          });
        } else {
          res.json({
            message: "Error",
          });
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
});
router.post("/sign-up", async (req, res) => {
  try {
    const { userId, firstName, lastName, email, password, pin } = req.body;
    if (validator.isValidEmail(email) === false) {
      res.json({
        message: "Invalid email",
      });
    } else {
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
          pin,
        });
        res.status(201).json({
          id: newUser._id,
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/pin-for-OAuth", async (req, res) => {
  const { email, newPin } = req.body;
  const user = await usersModel.find({ email: email });
  if (user) {
    const hashedPin = await bcrypt.hash(newPin, 8);
    const updatePin = await usersModel.findOneAndUpdate(
      { _id: user[0]._id },
      { pin: hashedPin }
    );
    if (updatePin) {
      res.json({ message: "Pin Updated" });
    } else {
      res.json({ message: "Error Occured" });
    }
  } else {
    res.json({ message: "Invalid User" });
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

router.post("/check-pin", async (req, res) => {
  try {
    const { email, pin } = req.body;
    const user = await usersModel.findPinByCredentials(email, pin);
    if (user) {
      res.json({
        message: "Valid User",
      });
    } else if (!user) {
      res.json({
        message: "Invalid User",
      });
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
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await usersModel.findOne({ email });
    if (user) {
      var token = require("crypto").randomBytes(10).toString("hex");
      const addToken = await usersModel.findOneAndUpdate(
        { _id: user._id },
        { changePasswordToken: token }
      );
      res.json({
        message: "Token generated",
      });
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/validate-forgot-password-token", async (req, res) => {
  try {
    const { changePasswordToken, newPassword } = req.body;
    const user = await usersModel.findOne({ changePasswordToken });
    if (user) {
      const resetPassword = await usersModel.findOneAndUpdate(
        { _id: user._id },
        { password: newPassword }
      );
      if (resetPassword) {
        const removePasswordToken = await usersModel.findOneAndUpdate(
          { _id: user._id },
          { changePasswordToken: "" }
        );
        res.json({
          message: "Reset successful",
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/forgot-pin", async (req, res) => {
  const { email } = req.body;
  const user = await usersModel.findOne({ email });
  if (user) {
    const randomPin = Math.floor(1000 + Math.random() * 9000);
    const resetPin = await usersModel.findOneAndUpdate(
      { _id: user._id },
      { pin: randomPin }
    );
    res.json({
      message: "Pin sent to email",
    });
  }
});

router.post("/change-password", async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;
    const user = await usersModel.findByCredentials(email, oldPassword);

    if (user) {
      const newPasswordUpdate = await usersModel.findOneAndUpdate(
        { _id: user._id },
        { password: newPassword }
      );
      res.json({
        message: "Password updated",
      });
    } else {
      res.json({
        message: "Password Incorrect",
      });
    }
  } catch (error) {
    console.log(error);
  }
});

// ----- END OF LOGIN AND SIGN UP ------ //

// ----- DOB, PROFESSION, AGE, PHONE, GENDER ------ //

router.put("/update-dob-profession", async (req, res) => {
  try {
    const { userId, dob, profession, phone, gender } = req.body;
    let dateOfBirth = dob.split("-");
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
      addressId,
      buildingName,
      addressLine1,
      addressLine2,
      town,
      city,
      currentAddress,
      postCode,
      dateOfArrival,
      dateOfDeparture,
    } = req.body;

    let findUser = await usersModel.findById(userId);
    if (findUser) {
      const item = findUser.addressHistory.filter(
        (ele) => JSON.stringify(ele._id) === JSON.stringify(addressId)
      );

      if (item.length != 0) {
        let itemIndex = findUser.addressHistory.findIndex(
          (p) => JSON.stringify(p._id) === JSON.stringify(addressId)
        );
        let addressItem = findUser.addressHistory[itemIndex];
        let allExistingDurationInMonths = "";
        let durationOfStay = "";
        let differenceInDates = moment(dateOfDeparture).diff(
          moment(dateOfArrival),
          "months"
        );
        if (differenceInDates <= 0) {
          res.json({
            message: "Date Of Arrival cannot be more than Date Of Departure",
          });
        } else if (differenceInDates > 12) {
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
          addressItem.buildingName = buildingName;
          addressItem.addressLine1 = addressLine1;
          addressItem.addressLine2 = addressLine2;
          addressItem.town = town;
          addressItem.city = city;
          addressItem.postCode = postCode;
          addressItem.currentAddress = currentAddress;
          addressItem.dateOfArrival =
            dateOfArrival[0] + "/" + dateOfArrival[1] + "/" + dateOfArrival[2];
          addressItem.dateOfDeparture =
            dateOfDeparture[0] +
            "/" +
            dateOfDeparture[1] +
            "/" +
            dateOfDeparture[2];
          addressItem.durationOfStay = durationOfStay;
          (addressItem.durationOfStayInMonths = differenceInDates),
            (findUser.addressHistory[itemIndex] = addressItem);

          res.json({
            message: "Address added",
          });
        } else {
          addressItem.buildingName = buildingName;
          addressItem.addressLine1 = addressLine1;
          addressItem.addressLine2 = addressLine2;
          addressItem.town = town;
          addressItem.city = city;
          addressItem.postCode = postCode;
          addressItem.currentAddress = currentAddress;
          addressItem.dateOfArrival =
            dateOfArrival[0] + "/" + dateOfArrival[1] + "/" + dateOfArrival[2];
          addressItem.dateOfDeparture =
            dateOfDeparture[0] +
            "/" +
            dateOfDeparture[1] +
            "/" +
            dateOfDeparture[2];
          addressItem.durationOfStay = durationOfStay;
          (addressItem.durationOfStayInMonths = differenceInDates),
            (findUser.addressHistory[itemIndex] = addressItem);
          res.json({
            message: "Address added",
          });
        }
        findUser = await findUser.save();
      } else {
        let allExistingDurationInMonths = "";
        if (findUser.addressHistory.length === 0) {
          let durationOfStay = "";
          let differenceInDates = moment(dateOfDeparture).diff(
            moment(dateOfArrival),
            "months"
          );

          if (differenceInDates <= 0) {
            res.json({
              message: "Date Of Arrival cannot be more than Date Of Departure",
            });
          } else if (differenceInDates > 12) {
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
              buildingName,
              addressLine1,
              addressLine2,
              town,
              city,
              postCode,
              currentAddress,
              dateOfArrival:
                dateOfArrival[0] +
                "/" +
                dateOfArrival[1] +
                "/" +
                dateOfArrival[2],
              dateOfDeparture:
                dateOfDeparture[0] +
                "/" +
                dateOfDeparture[1] +
                "/" +
                dateOfDeparture[2],
              durationOfStay,
              durationOfStayInMonths: differenceInDates,
            });
            findUser = await findUser.save();
            res.json({
              message: "Address added",
            });
          } else {
            findUser.addressHistory.push({
              buildingName,
              addressLine1,
              addressLine2,
              town,
              city,
              postCode,
              currentAddress,
              dateOfArrival:
                dateOfArrival[0] +
                "/" +
                dateOfArrival[1] +
                "/" +
                dateOfArrival[2],
              dateOfDeparture:
                dateOfDeparture[0] +
                "/" +
                dateOfDeparture[1] +
                "/" +
                dateOfDeparture[2],
              durationOfStay,
              durationOfStayInMonths: differenceInDates,
            });
            findUser = await findUser.save();
            res.json({
              message: "Address added",
            });
          }
        } else {
          allExistingDurationInMonths = findUser.addressHistory
            .map((item) => parseInt(item.durationOfStayInMonths))
            .reduce((acc, next) => acc + next);
          let durationOfStay = "";
          let differenceInDates = moment(dateOfDeparture).diff(
            moment(dateOfArrival),
            "months"
          );
          let addDurationOfStayInMonths =
            allExistingDurationInMonths + differenceInDates;
          if (differenceInDates <= 0) {
            res.json({
              message: "Date Of Arrival cannot be more than Date Of Departure",
            });
          } else if (differenceInDates > 12) {
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
              buildingName,
              addressLine1,
              addressLine2,
              town,
              city,
              postCode,
              currentAddress,
              dateOfArrival:
                dateOfArrival[0] +
                "/" +
                dateOfArrival[1] +
                "/" +
                dateOfArrival[2],
              dateOfDeparture:
                dateOfDeparture[0] +
                "/" +
                dateOfDeparture[1] +
                "/" +
                dateOfDeparture[2],
              durationOfStay,
              durationOfStayInMonths: differenceInDates,
            });
            findUser = await findUser.save();
            res.json({
              message: "Address added",
            });
          } else {
            findUser.addressHistory.push({
              buildingName,
              addressLine1,
              addressLine2,
              town,
              city,
              postCode,
              currentAddress,
              dateOfArrival:
                dateOfArrival[0] +
                "/" +
                dateOfArrival[1] +
                "/" +
                dateOfArrival[2],
              dateOfDeparture:
                dateOfDeparture[0] +
                "/" +
                dateOfDeparture[1] +
                "/" +
                dateOfDeparture[2],
              durationOfStay,
              durationOfStayInMonths: differenceInDates,
            });
            findUser = await findUser.save();
            res.json({
              message: "Address added",
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
      tag,
      joinDate,
      companyImage,
      price,
      description,
      dealName,
    } = req.body;
    let findUser = await usersModel.findById(userId);
    if (findUser) {
      let itemIndex = findUser.accounts.findIndex(
        (p) => p.serviceProviderName === serviceProviderName
      );
      if (itemIndex > -1) {
        let accountItem = findUser.accounts[itemIndex];
        if (accountItem.companyId === companyId) {
          accountItem.companyImage = companyImage;
          accountItem.dealName = dealName;
          accountItem.serviceProviderName = serviceProviderName;
          accountItem.tag = tag;
          accountItem.joinDate = joinDate;
          accountItem.description = description;
          accountItem.price = price;
        } else {
          findUser.accounts.push({
            companyId,
            companyImage,
            dealName,
            serviceProviderName,
            tag,
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
      dealId,
      companyImage,
      dealName,
      serviceProviderName,
      serviceType,
      price,
      description,
    } = req.body;
    let findUser = await usersModel.findById(userId);
    if (findUser) {
      const findWishlistItem = findUser.wishlist.filter(
        (item) => item.dealId === dealId
      );
      if (findWishlistItem.length !== 0) {
        res.json({
          message: "Item Already In Wishlist",
        });
      } else {
        findUser.wishlist.push({
          companyId,
          dealId,
          companyImage,
          dealName,
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
    } else {
      res.json({
        message: "User not found",
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

// router.get(
//   "/auth/google",
//   passport.authenticate("google", { scope: ["email", "profile"] }),
//   (res, req)
// );

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] }),
  (req, res) => {}
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/users/fail",
  }),
  (req, res, next) => {
    try {
      res.redirect(`http://localhost:3000/dashboard/${req.user.userId}`);
      res.end();
    } catch (e) {
      console.log(e);
    }
  }
);

// router.get("/success", (req, res) => {
//   res.redirect(`http://localhost:50391/dashboard/${req.user.userId}`);
// });
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

// ----- IMAGE UPLOAD ------ //p

router.post(
  "/image-upload/:userId",
  multer.single("image"),
  async (req, res) => {
    try {
      const result = await cloudinary.uploads(req.file.path);
      if (result) {
        const updateImage = await usersModel.findByIdAndUpdate(
          { _id: req.params.userId },
          { imageUrl: result.url }
        );
        if (updateImage) {
          res.json({
            message: "Image added successfully",
          });
        } else {
          res.json({
            message: "An error occured while uploading image",
          });
        }
      } else {
        res.json({
          message: "An error occured while uploading image",
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
);

// ----- END IMAGE UPLOAD ------ //

// ----- TRANSACTION HISTORY ------ //
router.post("/update-transaction-history", async (req, res) => {
  try {
    const {
      companyId,
      serviceProviderName,
      dealName,
      nextDueDate,
      price,
      description,
      userId,
    } = req.body;
    const todayDate = new Date().toLocaleDateString();
    var time =
      new Date().getHours() +
      ":" +
      new Date().getMinutes() +
      ":" +
      new Date().getSeconds();
    let findUser = await usersModel.findById(userId);
    if (findUser) {
      findUser.transactionHistory.push({
        companyId,
        serviceProviderName,
        dealName,
        dateOfTransaction: todayDate,
        timeOfTransaction: time,
        nextDueDate,
        price,
        description,
      });
      findUser = await findUser.save();
      res.json({
        message: "New transaction added for user",
      });
    }
  } catch (error) {
    console.log(error);
  }
});
// ----- END OF TRANSACTION HISTORY ------ //

// ----- NOTIFICATION ------ //
router.post("/update-notification", async (req, res) => {
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

// ----- END OF NOTIFICATION ------ //

module.exports = router;
