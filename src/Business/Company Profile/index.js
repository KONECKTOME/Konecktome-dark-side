const router = require("express").Router();
const companyModel = require("./schema");
const multer = require("../../Services/Cloudinary/multer");
const cloudinary = require("../../Services/Cloudinary/cloudinary");
const userModel = require("../../../src/Customers/Profiles/schema");

router.post(
  "/image-upload/:companyId",
  multer.single("image"),
  async (req, res) => {
    try {
      const result = await cloudinary.companyProfileUploads(req.file.path);
      if (result) {
        const updateImage = await companyModel.findByIdAndUpdate(
          { _id: req.params.companyId },
          { companyLogo: result.url }
        );

        if (updateImage) {
          res.json({
            message: "Image added successfully",
          });
        } else {
          res.json({
            message: "An error occured while uploading image",
          });
        }
      } else {
        res.json({
          message: "An error occured while uploading image",
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
);

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
    companyWebsite,
    trustPilotRating,
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
      companyWebsite,
      trustPilotRating,
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
    tag,
    companyLogo,
  } = req.body;
  const newFeatureArr = [];
  const featureArr = features.split(",");
  featureArr.map((feat) => {
    newFeatureArr.push({ featureText: feat });
  });
  let company = await companyModel.findById(companyId);
  if (company) {
    company.deals.push({
      companyName: company.companyName,
      companyLogo: company.companyLogo,
      dealName,
      dealPrice,
      speed,
      subTitle,
      tag,
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

router.get("/all-deals", async (req, res) => {
  try {
    let deals = [];
    const allCompanies = await companyModel.find();
    allCompanies.map((deal) => {
      return deals.push(...deal.deals);
    });
    res.send(deals);
  } catch (e) {
    console.log(e);
  }
});

router.get("/get-deal-by-id/:dealId", async (req, res) => {
  try {
    let deals = [];
    const allCompanies = await companyModel.find();
    allCompanies.map((deal) => {
      return deals.push(...deal.deals, deal.companyLogo);
    });
    const singleDeal = deals.filter(
      (d) => JSON.stringify(d._id) === JSON.stringify(req.params.dealId)
    );
    res.json({
      message: singleDeal,
    });
  } catch (e) {
    console.log(e);
  }
});

router.post("/update-reviews", async (req, res) => {
  try {
    const { userId, companyId, rating, comment } = req.body;
    let findUser = await userModel.findById(userId);
    let company = await companyModel.findById(companyId);
    if (company) {
      company.reviews.push({
        reviewerName: findUser.firstName + " " + findUser.lastName,
        rating,
        comment,
      });
      company = await company.save();
      res.json({
        message: "New review added",
      });
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
