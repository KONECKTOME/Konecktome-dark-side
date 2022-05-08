const router = require("express").Router();
const stripe = require("stripe")(process.env.STRIPE_DEV_SEC_KEY);
const usersModel = require("../Customers/Profiles/schema");
const express = require("express");

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

router.post("/create-product-price", async (req, res) => {
  const { productName, subscribePrice, oneOffprice, userId } = req.body;
  const oneTimeInPence = oneOffprice * 100;
  const subscribeInPence = subscribePrice * 100;
  try {
    let custID = "";
    let findUser = await usersModel.findById(userId);
    const product = await stripe.products.create({ name: productName });
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
    }
    const subscriptionPrice = await stripe.prices.create({
      unit_amount: subscribeInPence,
      currency: "gbp",
      product: product.id,
      recurring: { interval: "month" },
    });
    const oneTimePrice = await stripe.prices.create({
      unit_amount: oneTimeInPence,
      currency: "gbp",
      product: product.id,
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
      success_url: "http://localhost:3002/payment/succ",
      cancel_url: "http://localhost:3002/payment/fail",
    });

    res.send(session.url);

    // const retrieveSession = await stripe.checkout.sessions.retrieve(session.id);
    // console.log(retrieveSession);
  } catch (error) {
    console.log(error);
  }
});

// router.post(
//   "/web-hook",
//   express.raw({ type: "application/json" }),
//   async (req, res) => {
//     let data;
//     let eventType;
//     const webhookSecret = process.env.STRIPE_WEB_HOOK;
//     if (webhookSecret) {
//       let event;
//       let signature = req.headers["stripe-signature"];
//       try {
//         event = stripe.webhooks.constructEvent(
//           req.body,
//           signature,
//           webhookSecret
//         );
//       } catch (err) {
//         console.log(`⚠️  Webhook signature verification failed.`);
//         return res.sendStatus(400);
//       }
//       data = event.data;
//       eventType = event.type;
//     } else {
//       // Webhook signing is recommended, but if the secret is not configured in `config.js`,
//       // retrieve the event data directly from the request body.
//       data = req.body.data;
//       eventType = req.body.type;
//     }
//     switch (eventType) {
//       case "checkout.session.completed":
//         // Payment is successful and the subscription is created.
//         // You should provision the subscription and save the customer ID to your database.
//         break;
//       case "invoice.paid":
//         // Continue to provision the subscription as payments continue to be made.
//         // Store the status in your database and check when a user accesses your service.
//         // This approach helps you avoid hitting rate limits.
//         break;
//       case "invoice.payment_failed":
//         // The payment failed or the customer does not have a valid payment method.
//         // The subscription becomes past_due. Notify your customer and send them to the
//         // customer portal to update their payment information.
//         break;
//       default:
//       // Unhandled event type
//     }
//   }
// );

router.get("/succ", async (req, res) => {
  res.send("succ");
});

router.get("/fail", async (req, res) => {
  res.send("fail");
});

module.exports = router;
