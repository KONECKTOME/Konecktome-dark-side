const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const userProfile = require("../../Customers/Profiles/schema");

const extractProfile = async (req, res, profile, next) => {
  try {
    res.send(profile);
  } catch (error) {
    console.log(error);
  }
};

module.exports = async (passport, res, req) => {
  try {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: "http://localhost:3003/users/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
          const user = await userProfile.find({
            email: profile.emails[0].value,
          });
          console.log("user", user);

          if (user.length !== 0) {
            return done(null, { userId: user[0]._id });
          } else {
            const newUser = await userProfile.create({
              firstName: profile.name.givenName,
              lastName: profile.name.familyName,
              email: profile.emails[0].value,
              imageUrl: profile.photos[0].value,
            });
            return done(null, { userId: newUser._id });
          }
        }
      )
    );

    passport.serializeUser((user, done) => {
      return done(null, user);
    });

    passport.deserializeUser(function (user, done) {
      done(null, user);
    });
  } catch (error) {
    console.log(error);
  }
};

// module.exports = { extractProfile };
