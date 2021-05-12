const passport=require("passport");
var GoogleStrategy = require('passport-google-oauth20').Strategy;
passport.serializeUser(function(user, done) {
    //console.log("serial ",user," done",done);
    done(null, user);
  });
  
  passport.deserializeUser(function(user, done) {
    //User.findById(id, function(err, user) {
       // console.log("deserial ",user," done",done);
      done(null, user);
    //});
  });
passport.use(new GoogleStrategy({
    clientID: "57122513134-jpioiaqpclg6qe71f2v29ovnrms9l0a2.apps.googleusercontent.com",
    clientSecret: "aN3UaQcvAkIBPlXwlwY4jn40",
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    //User.findOrCreate({ googleId: profile.id }, function (err, user) {
      //console.log(profile);
    return cb(null, profile);
    //});
  }
));