const router = require("express").Router();
const impressionsModel = require("../Impressions/schema");

router.post("/new-impressions", async (req, res) => {
  try {
    let { page } = req.body;
    let impressions = await impressionsModel.find();
    if (impressions.length !== 0) {
      if (page === "Landing") {
        const updatedResult = await impressionsModel.findByIdAndUpdate(
          { _id: impressions[0]._id },
          {
            landingPage: impressions[0].landingPage + 1,
          }
        );
        if (updatedResult) {
          res.json({ message: "Updated" });
        }
      } else if (page === "Explore") {
        const updatedResult = await impressionsModel.findByIdAndUpdate(
          { _id: impressions[0]._id },
          {
            explorePage: impressions[0].explorePage + 1,
          }
        );
        if (updatedResult) {
          res.json({ message: "Updated" });
        }
      } else if (page === "Article") {
        const updatedResult = await impressionsModel.findByIdAndUpdate(
          { _id: impressions[0]._id },
          {
            articles: impressions[0].articles + 1,
          }
        );
        if (updatedResult) {
          res.json({ message: "Updated" });
        }
      }
    } else {
      if (page === "Landing") {
        let newLanding = await impressionsModel.create({
          landingPage: 1,
        });
        if (newLanding) {
          res.json({ message: "New impression added" });
        }
      } else if (page === "Explore") {
        let newLanding = await impressionsModel.create({
          explorePage: 1,
        });
        if (newLanding) {
          res.json({ message: "New impression added" });
        }
      } else if (page === "Article") {
        let newLanding = await impressionsModel.create({
          articles: 1,
        });
        if (newLanding) {
          res.json({ message: "New impression added" });
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
