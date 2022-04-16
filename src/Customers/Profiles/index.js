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
          accountItem.companyId = companyId;
          accountItem.serviceProviderName = serviceProviderName;
          accountItem.serviceType = serviceType;
          accountItem.joinDate = joinDate;
          accountItem.description = description;
          accountItem.price = price;
        }
        findUser = await findUser.save();
        res.send("Account updated");
      } else {
        findUser.accounts.push({
          companyId,
          serviceProviderName,
          serviceType,
          joinDate,
          description,
          price,
        });
        findUser = await findUser.save();
        res.json({
          message: "User account updated",
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
