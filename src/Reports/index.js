const router = require("express").Router();
const mongoose = require("mongoose");
const pageViewsSchema = require("../Reports/schema");

router.get("/", async (req, res) => {
  try {
    const allPageViews = await pageViewsSchema.find();
    res.send(allPageViews);
  } catch (error) {
    console.log(error);
  }
});

router.post("/newPageView", async (req, res) => {
  const { date, pageViews } = req.body;
  try {
    const pageViewsPerWeek = [];
    let totalPageViewsPerWeek = "";
    const curr = new Date();
    const first = curr.getDate() - curr.getDay();
    const last = first + 6;
    const firstday = new Date(curr.setDate(first)).toLocaleDateString();
    const lastday = new Date(curr.setDate(last)).toLocaleDateString();
    var dd = curr.getDay() + 2;
    var mm = curr.getMonth() + 1;
    var yyyy = curr.getFullYear();
    const today = dd + "/" + mm + "/" + yyyy;
    // const today = curr.toLocaleDateString("en-GB", {
    //   year: "numeric",
    //   month: "2-digit",
    //   day: "2-digit",
    // });

    const daysInWeek = firstday + " - " + lastday;
    let foundReport = await pageViewsSchema.findOne({ daysInWeek });
    if (foundReport) {
      let itemIndex = foundReport.report.findIndex((p) => p.date === today);
      if (itemIndex > -1) {
        let reportItem = foundReport.report[itemIndex];
        reportItem.pageViews++;
        foundReport = await foundReport.save();
        const findPageViews = foundReport.report.map((pv) => {
          return pageViewsPerWeek.push(pv.pageViews);
        });
        totalPageViewsPerWeek = pageViewsPerWeek.reduce((a, b) => a + b, 0);
        await pageViewsSchema.findByIdAndUpdate(foundReport._id, {
          totalPageViews: totalPageViewsPerWeek,
        });
        res.send("success");
      } else {
        foundReport.report.push({ date: today, pageViews: 1 });
        foundReport = await foundReport.save();
        const findPageViews = foundReport.report.map((pv) => {
          return pageViewsPerWeek.push(pv.pageViews);
        });
        totalPageViewsPerWeek = pageViewsPerWeek.reduce((a, b) => a + b, 0);
        await pageViewsSchema.findByIdAndUpdate(foundReport._id, {
          totalPageViews: totalPageViewsPerWeek,
        });
        res.send("success");
      }
    } else {
      const newPageView = await pageViewsSchema.create({
        daysInWeek: daysInWeek,
        report: [
          {
            date: today,
            pageViews: 1,
          },
        ],
        totalPageViews: 1,
      });

      res.json({
        message: newPageView,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
