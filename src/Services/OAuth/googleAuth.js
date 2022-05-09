const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");

const userProfile = require("../../Customers/Profiles/schema");

//   const extractProfile = async (req, res, profile) => {
//     try {
//       res.send(profile);
//     } catch (error) {
//       console.log(error);
//     }
//   };

module.exports = async (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3002/users/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, cb) => {
        const user = await userProfile.find({ email: profile.emails[0].value });
        if (user.length !== 0) {
          return cb(null, extractProfile(user));
        } else {
          const newUser = await userProfile.create({
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
            imageUrl: profile.photos[0].value,
          });
          return cb(null, newUser);
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
};

// module.exports = { extractProfile };
