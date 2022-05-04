const router = require("express").Router();
const companyModel = require("./schema");

router.get("/", async (req, res) => {
  try {
    const allCompanies = await companyModel.find();
    res.send(allCompanies).status(200);
  } catch (error) {
    console.log(error);
  }
});

router.post("/add-new-company", async (req, res) => {
  const {
    companyName,
    companyDescription,
    addressLine1,
    addressLine2,
    postCode,
    phoneNumber,
    email,
  } = req.body;
  const company = await companyModel.find({ companyName: companyName });
  if (company.length > 0) {
    res.json({
      message: "Company already exists",
    });
  } else {
    const newCompany = await companyModel.create({
      companyName,
      companyDescription,
      companyContactDetails: [
        {
          addressLine1,
          addressLine2,
          postCode,
          phoneNumber,
          email,
        },
      ],
    });
    res.status(201).send(newCompany._id);
  }
});

router.post("/add-company-poc", async (req, res) => {
  const { pocFirstName, pocLastName, pocPhone, pocEmail, companyId } = req.body;
  let company = await companyModel.findById(companyId);
  if (company) {
    if (company.companyPOC.length === 0) {
      company.companyPOC.push({
        pocFirstName,
        pocLastName,
        pocPhone,
        pocEmail,
      });
      company = await company.save();
      res.status(201).json({
        message: "Company POC added",
      });
    } else {
      res.status(201).json({
        message: "Company already has a POC",
      });
    }
    // } else if (
    //   company.companyPOC.length !== 0 &&
    //   pocEmail === company.companyPOC[0].pocEmail
    // ) {
    //   res.status(201).json({
    //     message: "POC already exists",
    //   });
    // } else if (
    //   company.companyPOC.length !== 0 &&
    //   pocEmail !== company.companyPOC[0].pocEmail
    // ) {
    //   company.companyPOC.push({
    //     pocFirstName,
    //     pocLastName,
    //     pocPhone,
    //     pocEmail,
    //   });
    //   company = await company.save();
    //   res.status(201).json({
    //     message: "Company POC added",
    //   });
    // }
  } else {
    res.status(404).json({
      message: "Company not found",
    });
  }
});

router.post("/add-company-deals", async (req, res) => {
  const {
    dealName,
    dealPrice,
    speed,
    subTitle,
    companyId,
    setUpFee,
    contractDuration,
    features,
  } = req.body;
  const newFeatureArr = [];
  const featureArr = features.split(",");
  featureArr.map((feat) => {
    newFeatureArr.push({ featureText: feat });
  });
  let company = await companyModel.findById(companyId);
  if (company) {
    company.deals.push({
      dealName,
      dealPrice,
      speed,
      subTitle,
      dealContractPlans: [
        {
          setUpFee,
          contractDuration,
        },
      ],
      features: newFeatureArr,
    });
    company = await company.save();
    res.status(201).json({
      message: "Company deal added",
    });
  } else {
    res.status(404).json({
      message: "Company not found",
    });
  }
});

module.exports = router;
