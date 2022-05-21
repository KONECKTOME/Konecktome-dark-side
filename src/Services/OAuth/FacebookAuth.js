const passport = require("passport");
const userProfile = require("../../Customers/Profiles/schema");
const FacebookStrategy = require("passport-facebook");

module.exports = async (passport) => {
  try {
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_CLIENT_ID,
          clientSecret: process.env.FACEBOOK_CLIENT_SECRECT,
          callbackURL: "http://localhost:3002/users/oauth2/redirect/facebook",
        },
        async (accessToken, refreshToken, profile, cb) => {
          console.log(profile);
          cb(null, profile);
          const user = await userProfile.find({
            facebookId: profile.id,
          });
          if (user.length !== 0) {
            return done(null, { userId: user[0]._id });
          } else {
            const newUser = await userProfile.create({
              firstName: profile.name.givenName,
              lastName: profile.name.familyName,
              gender: profile.gender,
              facebookId: profile.id,
            });
            return done(null, { userId: newUser._id });
          }
        }
      )
    );
    passport.serializeUser((user, done) => {
      done(null, user);
    });

    passport.deserializeUser(function (user, done) {
      done(null, user);
    });
  } catch (error) {
    console.log(error);
  }
};
