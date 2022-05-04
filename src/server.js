const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const mailList = require("./mailing-list/index");
const report = require("./Reports/index");
const users = require("./Customers/Profiles/index");
const crawler = require("./Amenities/crawlerRoutes");
const companies = require("./Business/Company Profile/index");
const transactions = require("./Transactions/index");
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
server.use("/mail", mailList);
server.use("/reporting", report);
// console.log("endpoints", listEndpoints(server));

// var token = require("crypto").randomBytes(48).toString("hex");
// console.log(token);

mongoose
  .connect("mongodb://localhost:27017/Konecktome", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(
    server.listen(port, () => {
      console.log("Server is running on port", port);
    })
  )
  .catch((err) => console.log(err));
