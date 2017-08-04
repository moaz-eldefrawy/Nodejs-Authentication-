/* requires */
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var morgan = require('morgan');
var session = require('express-session');
var Db = require('mongodb').Db;

/* routes */

var index = require('./routes/index');
var users = require('./routes/users');
var configDb = require('./config/database.js');


var app = express();
mongoose.connect(configDb.url, {
  useMongoClient: true,
  config: {
    autoIndex: false
  },

});

require('./config/passport')(passport); // pass passport for
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(morgan(':method / :response-time ms / :status'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// required for password (password  > app.use)
app.use(session({
  secret: "iloveprogramming",
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// routing
app.use('/', index);
app.use('/users', users);
app.get('/login', function(req, res){
  res.render("login", {message: req.flash('loginMessage')});
});
app.get('/signup', function(req, res) {
   res.render('signup', { message: req.flash('signupMessage') });
});
app.get('/profile', isLoggedIn ,function(req,res){
    res.render('profile', {
      user: req.user
    });
});
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


app.post("/signup", passport.authenticate('local-signup', {
  successRedirect: '/',
  failutreRedirect: '/signup',
  failureFlash: true
}));
app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

app.get('/auth/facebook', passport.authenticate('facebook', { authType: 'rerequest', scope: ['user_friends'] })
);

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
});

function isLoggedIn(req, res, next){

  if(req.isAuthenticated())
    return next();

  res.redirect('/');
}

// catch 404 and forward to error handler
/*app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});*/

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
