const router = require("express").Router();
const articleModel = require("../Article/schema");

router.get("/", async (req, res) => {
  try {
    const articles = await articleModel.find();
    res.json({
      message: articles,
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/new-article", async (req, res) => {
  try {
    let { title, description, author, image, paragraphs } = req.body;
    const newArticle = await articleModel.create({
      title,
      description,
      author,
      image,
      paragraphs,
    });
    res.json({
      message: newArticle,
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/get-article", async (req, res) => {
  try {
    let { articleId } = req.body;
    let article = await articleModel.findById(articleId);
    res.json({
      message: article,
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
