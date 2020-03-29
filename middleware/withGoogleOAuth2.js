require("dotenv").config();
const { google } = require("googleapis");
const User = require("../models/user.model");

const withGoogleOAuth2 = (req, res, next) => {
  if (req.session.user) {
    // Create OAuth2 Client object
    req.oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.DOMAIN + "oauthcallback"
    );
    // Store user's refresh token in their session
    if (!req.session.user.gcAuthToken) {
      return User.findOne({ username: req.session.user.username })
      .then(user => {
        if (user && user.gcAuthToken) {
          req.session.user.gcAuthToken = user.gcAuthToken;
          req.oAuth2Client.setCredentials({
            refresh_token: user.gcAuthToken // async?
          });
        }
      })
      .catch(console.log)
      .finally(() => next());
    } else {
      req.oAuth2Client.setCredentials({
        refresh_token: req.session.user.gcAuthToken
      });
    }
  }
  next();
};

module.exports = withGoogleOAuth2;
