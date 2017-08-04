var LocalStrategy   = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var passport = require("passport");
var User = require('./userSchema.js');
var configAuth = require('./auth.js');

module.exports = function(passport) {

  passport.serializeUser(function(user, done) {
      done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
  //    console.log(id); =>> amr's document ID
      User.findById(id, function(err, user) {
          done(err, user);
      });
  });

  // =========================================================================
  // LOCAL SIGNUP ============================================================
  // =========================================================================
  // TODO >> This middleware is only called for un-authenticated users
  passport.use('local-signup', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {
        process.nextTick(function() {
          console.log("\nreq from passport.js:");
          console.log(req);

          User.findOne({ 'local.email' :  email }, function(err, user) {
              // if there are any errors, return the error
              if (err)
                  return done(err);

              // check to see if theres already a user with that email
              if (user) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
              }
              else {

                // if there is no user with that email
              // create the user
                var newUser            = new User();

                // set the user's local credentials
                newUser.local.email    = email;
                newUser.local.password = newUser.generateHash(password);
                // save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
              }
          });
        });
    }));

  // =========================================================================
  // local Sign in ===========================================================
  // =========================================================================
  passport.use('local-login', new LocalStrategy({
    usernameField: 'fuck',
    passwordField: 'password',
    passReqToCallback: true
  },function(req, email, password, done){
    process.nextTick(function() {
      console.log("LOCAL STRAGETGY IS GOING")
      User.findOne({'local.email': email  }, function(err, user){
        if(err) done(err);
        if(user == null) return done(null, false, req.flash('loginMessage', 'No User Found.'));
        //console.log("handling passwords");
        //console.log(password + " - " + email);
        //console.log(user);
        //console.log(user.validPassword(password));
        if(!user.validPassword(password))
          return done(null, false, req.flash('loginMessage', 'Oops! Wrong Password.'));

        return done(null, user);
      });
    });
  }

  ));

  // =========================================================================
  // Facebook Sign-in ============================================================
  // =========================================================================

  passport.use(new FacebookStrategy({
    clientID: configAuth.facebookAuth.clientID,
    clientSecret: configAuth.facebookAuth.clientSecret,
    callbackURL: configAuth.facebookAuth.callbackURL,
    profileFields: ['id', 'email', 'gender', 'link', 'locale', 'verified', 'displayName'],
    enableProof: true
  }, function(token, refreshToken, profile, done){
    process.nextTick(function(){
      User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
        console.log("\nFacebook Passport:");
        console.log(profile); console.log(user);
        if (err)
            return done(err);
        if (user) {
            return done(null, user); // user found, return that user
        } else {
            // if there is no user found with that facebook id, create them
            var newUser            = new User();

            // set all of the facebook information in our user model
            newUser.facebook.id    = profile.id; // set the users facebook id
            newUser.facebook.token = token; // we will save the token that facebook provides to the user
            newUser.facebook.name  = profile.displayName; // look at the passport user profile to see how names are returned
            newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first

            // save our user to the database
            newUser.save(function(err) {
                if (err)
                    throw err;

                // if successful, return the new user
                return done(null, newUser);
            });
          }
        });
    });
  } /* End of the Token Function */
)); /* End of the Strategy */
};
