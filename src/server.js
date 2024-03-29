const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const mailList = require("./mailing-list/index");
const report = require("./Reports/index");
const cors = require("cors");
const server = express();
const port = process.env.PORT || 3002;
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(express.json());
server.use(cors());
server.use("/mail", mailList);
server.use("/reporting", report);

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
