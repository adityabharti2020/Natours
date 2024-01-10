const { promisify } = require('util');
const User = require('../Model/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

// const createSendToken = (user,statusCode, res, message)=>{
//   const token = signToken(user._id);
//   const cookieOPtions = {

//   }
// }
exports.signUp = catchAsync(async (req, res) => {
  // const newUser = await User.create(req.body);
  const {
    name,
    email,
    password,
    photo,
    passwordCofirm,
    role,
    passwordChangedAt,
  } = req.body;
  const newUser = await User.create({
    name,
    email,
    password,
    photo,
    role,
    passwordCofirm,
    passwordChangedAt,
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

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // 1.Getting token and check of its there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('You are not loggedIn! Please login to get access', 401),
    );
  }
  // console.log("token:",token)
  // 2.Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log("decoded",decoded) will give this :- decoded { id: '659d9417dbf5652c14b2ece2', iat: 1704870918, exp: 1712646918 }

  // 3.check if user still exists
  const currentUser = await User.findById(decoded.id); //will chek who is created token is exist or deleted
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401,
      ),
    );
  }
  // 4.check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! please login again.', 401),
    );
  }
  //5.Grant access to protected route
  req.user = currentUser; //req object is accessable to middleware to middleware directly
  next(); //will go to next middleware
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin','lead-guide']. role="user"
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403), //403 = forbidden
      );
    }
    next();
  };
};
exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1.get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email address.', 404));
  }
  //2.genrate the rendom reset token
  const resetToken = user.createPasswordResetToken();
  await user.save();
});
exports.resetPassword = (req, res, next) => {};
