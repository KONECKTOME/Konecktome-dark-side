const router = require("express").Router();
const usersModel = require("../Customers/Profiles/schema");

router.get("/transaction-by-user/:id", async (req, res) => {
  try {
    let findUser = await usersModel.findById(req.params.id);
    res.send(findUser.transactionHistory).status(200);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
