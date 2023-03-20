const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const affiliate = require("../src/Affiliate/index");
const article = require("../src/Article/index");
const tracking = require("../src/Tracking/index");
const cors = require("cors");
const server = express();
const port = process.env.PORT || 3002;
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(express.json());
server.use(cors());

server.use("/aff", affiliate);
server.use("/article", article);
server.use("/tracking", tracking);

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
