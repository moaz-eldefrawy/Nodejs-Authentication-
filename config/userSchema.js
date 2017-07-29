var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  local: {
    email: String,
    password: String
  },
  facebook: {
    id: String,
    token: String,
    email: String,
    name: String
  }
});

/* methods */
userSchema.methods.generateHash = function(password){
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password){
  return bcrypt.compareSync(password, this.local.password);
};
/*
var User = mongoose.model('user', userSchema);
  User.findOne({'local.email': 'moaz@mail.com'}, function(err, user){
  console.log("UserSchema.js:\n")
  console.log(err);
  console.log(user);
})*/

module.exports = mongoose.model('user', userSchema);
