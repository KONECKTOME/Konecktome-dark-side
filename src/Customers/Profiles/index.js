const router = require("express").Router();
const usersModel = require("./schema");
const mongoose = require("mongoose");

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

    const newUser = await usersModel.create({
      firstName,
      lastName,
      email,
      password,
    });
    res.json({
      message: "Sign up successful",
      data: newUser,
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { userId } = req.body;
    const allUsers = await usersModel.find();
    const findUser = await usersModel.findById(userId);
    res.send(userId);
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
    console.log(cardId);
    if (findUser) {
      if (findUser.paymentDetails.length !== 0) {
        console.log(findUser.paymentDetails);
        const filter = findUser.paymentDetails.filter((p) => p._id === cardId);
        console.log(filter);
        let itemIndex = findUser.paymentDetails.findIndex(
          (p) => p._id === cardId
        );
        console.log(itemIndex);
        if (itemIndex > -1) {
          let cardItem = findUser.paymentDetails[itemIndex];
          cardItem.cardNumber = cardNumber;
          cardItem.expiryDate = expiryDate;
          cardItem.cvc = cvc;
          cardItem.expiryDate = expiryDate;
          cardItem.cardHolderName = cardHolderName;
        } else {
          findUser.paymentDetails.push({
            cardNumber,
            expiryDate,
            cvc,
            cardHolderName,
          });
        }
        findUser = await findUser.save();
        res.json({
          message: "New card added for user",
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

module.exports = router;
