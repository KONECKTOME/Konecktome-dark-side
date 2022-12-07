const router = require("express").Router();
const stripe = require("stripe")(process.env.STRIPE_DEV_SEC_KEY);
const usersModel = require("../Customers/Profiles/schema");
const paymentModel = require("../Payment/schema");

router.post("/create-product-price", async (req, res) => {
  const { productName, subscribePrice, oneOffprice, userId, dealId } = req.body;

  try {
    const oneTimeInPence = parseInt(oneOffprice) * 100;
    const subscribeInPence = parseInt(subscribePrice) * 100;
    const todayDate = new Date().toLocaleDateString();
    console.log("deals", dealId);
    var time =
      new Date().getHours() +
      ":" +
      new Date().getMinutes() +
      ":" +
      new Date().getSeconds();

    let custID = "";
    let productId = "";
    let findUser = await usersModel.findById(userId);

    let findProduct = await paymentModel.findOne({ productName: productName });

    if (findProduct) {
      productId = findProduct.stripeProductId;
    } else if (!findProduct) {
      const product = await stripe.products.create({ name: productName });
      productId = product.id;
    }

    if (!findUser.stripeCustId) {
      const customer = await stripe.customers.create({
        email: findUser.email,
      });
      custID = customer.id;
      let updateCustId = await usersModel.findOneAndUpdate(
        { _id: userId },
        {
          stripeCustId: customer.id,
        }
      );
      findUser = await findUser.save();
    } else {
      custID = findUser.stripeCustId;
      let retreiveCustomer = await stripe.customers.retrieve(custID);
      if (findUser.email !== retreiveCustomer.email) {
        const updateCustomer = await stripe.customers.update(custID, {
          email: findUser.email,
        });
      }
    }
    if (custID !== "") {
      const subscriptionPrice = await stripe.prices.create({
        unit_amount: subscribeInPence,
        currency: "gbp",
        recurring: { interval: "month" },
        product: productId,
      });
      const oneTimePrice = await stripe.prices.create({
        unit_amount: oneTimeInPence,
        currency: "gbp",
        product: productId,
      });
      const lineItemsArr = [
        { price: subscriptionPrice.id, quantity: 1 },
        { price: oneTimePrice.id, quantity: 1 },
      ];
      const session = await stripe.checkout.sessions.create({
        customer: custID,
        billing_address_collection: "auto",
        line_items: lineItemsArr,
        mode: "subscription",
        success_url: `http://konecktome-mvp.herokuapp.com/dashboard/pay-success/${userId}/${dealId}`,
        cancel_url: "http://konecktome-mvp.herokuapp.com/payment/fail",
      });
      if (session.url) {
        res
          .json({
            url: session.url,
          })
          .status(200);
      }
    } else {
      res
        .json({
          message: "An error occured",
        })
        .status(500);
    }
  } catch (error) {
    console.log(error);
  }
});

router.get("/succ", async (req, res) => {
  res.send("succ");
});

router.get("/fail", async (req, res) => {
  res.send("fail");
});

module.exports = router;
