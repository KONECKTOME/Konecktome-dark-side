const { model, Schema } = require("mongoose");

const pageViewsSchema = new Schema({
  daysInWeek: { type: String, required: true },
  report: [
    {
      date: { type: String, required: true },
      pageViews: { type: Number },
    },
  ],
  totalPageViews: { type: Number },
});

const pageViewsModel = model("pageviews-report", pageViewsSchema);

module.exports = pageViewsModel;
