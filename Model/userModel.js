const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'please provide a valid email'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'please provide a password'],
    minlength: 8,
    select:false
  },
  passwordCofirm: {
    type: String,
    required: [true, 'please confirm your password'],
    validate: {
      validator: function (e1) {
        return e1 === this.password;
      },
      message: 'password are not same',
    },
  },
});

userSchema.pre('save', async function (next) {
  // it will run if password was actually modified
  if (!this.isModified('password')) return next();

  //hash the password with coast of 12
  this.password = await bcrypt.hash(this.password, 12);

  //delete the passwordConfirm field
  this.passwordCofirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function(candidatePassword,userPassword){
  return await bcrypt.compare(candidatePassword,userPassword)
}
const User = mongoose.model('User', userSchema);
module.exports = User;
