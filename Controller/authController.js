const User = require('../Model/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

exports.signUp = catchAsync(async (req, res) => {
  // const newUser = await User.create(req.body);
  const { name, email, password, photo, passwordCofirm } = req.body;
  const newUser = await User.create({
    name,
    email,
    password,
    photo,
    passwordCofirm,
  });
  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'SignUp successfully',
    token,
    data: {
      newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1.check email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  //2.check user exist and password is correct
  const user = await User.findOne({ email }).select('+password');
  // const correct = await user.correctPassword(password, user.password);
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  // 3. if everything ok send token to the client
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});
