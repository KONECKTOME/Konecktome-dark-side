const router = require("express").Router();
const affiliateModel = require("../Affiliate/schema");

router.get("/", async (req, res) => {
  try {
    let deals = [];
    const allDeals = await affiliateModel.find();
    allDeals.map((deal) => {
      return deals.push(deal.deals);
    });
    res.send(deals);
  } catch (error) {
    console.log(error);
  }
});

router.post("/new-brand", async (req, res) => {
  const {
    brandName,
    title,
    image,
    price,
    priceSubSection,
    duration,
    promotions,
    features,
  } = req.body;
  try {
    const newBrand = await affiliateModel.create({
      brandName,
      deals: [
        {
          promotions,
          title,
          image,
          price,
          priceSubSection,
          features,
          duration,
        },
      ],
    });
    res.send(newBrand);
  } catch (error) {
    console.log(error);
  }
});

router.post("/add-new-deal", async (req, res) => {
  const {
    brandId,
    title,
    image,
    price,
    priceSubSection,
    duration,
    promotions,
    features,
  } = req.body;
  try {
    let brand = await affiliateModel.findById(brandId);
    if (brand) {
      brand.deals.push({
        title,
        image,
        price,
        priceSubSection,
        duration,
        promotions,
        features,
      });
      brand = await brand.save();
      res.send("Deal Added for brand");
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
