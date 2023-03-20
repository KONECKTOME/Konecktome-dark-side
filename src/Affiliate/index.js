const router = require("express").Router();
const affiliateModel = require("../Affiliate/schema");

router.get("/", async (req, res) => {
  try {
    let deals = [];
    const allDeals = await affiliateModel.find();
    allDeals.map((deal) => {
      return deals.push(...deal.deals);
    });
    res.json({
      message: deals,
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/new-brand", async (req, res) => {
  const {
    brandName,
    brandDescription,
    brandId,
    Brand,
    Type,
    Name,
    Speed,
    Contract,
    Downloads,
    Calls,
    VAT,
    Setup,
    Price,
    Offers,
    OfferPrice,
    Benefits,
    url,
    image,
  } = req.body;
  try {
    const newBrand = await affiliateModel.create({
      brandName,
      brandDescription,
      deals: [
        {
          brandId,
          Brand,
          Type,
          Name,
          Speed,
          Contract,
          Downloads,
          Calls,
          VAT,
          Setup,
          Price,
          Offers,
          OfferPrice,
          Benefits,
          url,
          image,
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
      brand.deals.push({});
      brand = await brand.save();
      res.send("Deal Added for brand");
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/brand-details", async (req, res) => {
  try {
    let { brandId } = req.body;
    let brand = await affiliateModel.findById(brandId);
    res.json({
      message: brand,
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
