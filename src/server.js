const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const mailList = require("./mailing-list/index");
const report = require("./Reports/index");
const users = require("./Customers/Profiles/index");
const crawler = require("./Crawler/index");
const companies = require("./Business/Company Profile/index");
const transactions = require("./Transactions/index");
const payment = require("./Payment/index");
const cors = require("cors");
const server = express();
const listEndpoints = require("express-list-endpoints");

const port = process.env.PORT || 3002;
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));
server.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // disabled for security on local
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});
server.use(express.json());
server.use(cors());
server.use("/users", users);
server.use("/companies", companies);
server.use("/crawler", crawler);
server.use("/transactions", transactions);
server.use("/payment", payment);
server.use("/mail", mailList);
server.use("/reporting", report);
// console.log("endpoints", listEndpoints(server));

// var token = require("crypto").randomBytes(10).toString("hex");
// console.log(token);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_ATLAS_USER}:${process.env.MONGO_ATLAS_PASS}@cluster0.z41kz.mongodb.net/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    }
  )
  .then(
    server.listen(port, () => {
      console.log("Server is running on port", port);
    })
  )
  .catch((err) => console.log(err));