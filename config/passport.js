var LocalStrategy   = require('passport-local').Strategy;
var passport = require("passport");
var User = require('./userSchema.js');

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================

    passport.use('local-signup', new LocalStrategy({
          usernameField : 'email',
          passwordField : 'password',
          passReqToCallback : true // allows us to pass back the entire request to the callback
      },
      function(req, email, password, done) {
          process.nextTick(function() {

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
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    },function(req, email, password, done){
      process.nextTick(function() {
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

};
