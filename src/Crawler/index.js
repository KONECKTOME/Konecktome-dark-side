const router = require("express").Router();

const crawler = require("../Services/Web Crawler/crawler");

router.get("/test-crawler", async (req, res) => {
  try {
    const { url } = req.body;
    const channelData = await crawler.scrapeChannel(url);
    res.send(channelData);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
