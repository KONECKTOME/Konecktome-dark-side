const router = require("express").Router();
const usersModel = require("./schema");
const {
  refreshToken,
  generateToken,
} = require("../../Services/OAuth/authTools");
const { authorize } = require("../../Services/Middlewares/authorize");
const passport = require("passport");
require("../../Services/OAuth/googleAuth")(passport);
const { crawler } = require("../../Services/Web Crawler/crawler");
const multer = require("../../Services/Cloudinary/multer");
const cloudinary = require("../../Services/Cloudinary/cloudinary");

router.get("/", async (req, res) => {
  try {
    const allUsers = await usersModel.find();
    res.send(allUsers).status(200);
  } catch (error) {
    console.log(error);
  }
});

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

router.put("/update-address", async (req, res) => {
  try {
    const {
      userId,
      addressLine1,
      addressLine2,
      postCode,
      profession,
      phoneNumber,
    } = req.body;

    let findUser = await usersModel.findOneAndUpdate(
      { _id: userId },
      {
        phone: phoneNumber,
        profession,
        addressLine1,
        addressLine2,
        postCode,
      }
    );
    if (findUser) {
      res.json({
        message: "User address updated!",
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

// router.get("/test-crawler", async (req, res) => {
//   try {
//     const crawl = await crawler();
//   } catch (error) {
//     console.log(error);
//   }
// });

module.exports = router;
