const jwt = require("jsonwebtoken");
const profileModel = require("../../Customers/Profiles/schema");

const { verifyJWT } = require("../OAuth/authTools");

const authorize = async (req, res, next) => {
  try {
    // const token = req.cookies.token;
    const token = req.headers.authorization.replace("Bearer ", "");

    if (token) {
      const credentials = await verifyJWT(token);

      const user = await profileModel.findById(credentials._id);

      if (user) {
        // req.user = user;
        res.json({
          userId: user._id,
          message: "User Found",
        });
        next();
      } else {
        res.json({ message: "User Not Found" });
      }
    }
  } catch (e) {
    console.log(e);
    const err = new Error("Please authenticatee");
    err.httpStatusCode = 401;
    next(err);
  }
};

const adminOnlyMiddleware = async (req, res, next) => {
  if (req.user && req.user.role === "admin") next();
  else {
    const err = new Error("Only for admins!");
    err.httpStatusCode = 403;
    next(err);
  }
};

module.exports = { authorize, adminOnlyMiddleware };
