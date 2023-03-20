const router = require("express").Router();
const trackingModel = require("../Tracking/schema");
const affiliateModel = require("../Affiliate/schema");

router.post("/new-tracking", async (req, res) => {
  try {
    let { brandId } = req.body;
    let findBrand = await trackingModel.findOne({ brandId });
    let findBrandInAffiliateModel = await affiliateModel.findById(brandId);
    if (findBrand) {
      const updateBrand = await trackingModel.findOneAndUpdate(
        { brandId: brandId },
        {
          clicks: findBrand.clicks + 1,
        }
      );
    } else {
      const newBrand = await trackingModel.create({
        brandName: findBrandInAffiliateModel.brandName,
        brandId,
        clicks: 1,
      });
    }
    res.json({ message: "Click Added" });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
