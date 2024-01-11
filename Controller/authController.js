const crypto = require('crypto');
const { promisify } = require('util');
const User = require('../Model/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

const createSendToken = (user, statusCode, res, message) => {
  const token = signToken(user._id);

  res.status(statusCode).json({
    status: message,
    token,
    data: {
      user,
    },
  });
};
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
  createSendToken(newUser, 201, res,"Sign up successfully");
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
  createSendToken(user, 200, res,"login Successfully");
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
  // console.log(user)
  if (!user) {
    return next(new AppError('There is no user with this email address.', 404));
  }
  //2.genrate the rendom reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //validateBeforeSave is using here to disable the validation of model fields
  //3.send it to user email
  console.log('reset token => ', resetToken);
  const resetURL = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH req with your new password and passwordConfirm to ${resetURL}.\nIf you didn't forgot your password, please ignore this email`;

  // console.log("before try",user.email)
  try {
    await sendEmail({
      email: user.email,
      subject: 'your password reset token (valid for 10 min)',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (error) {
    (user.passwordResetToken = undefined),
      (user.passwordResetTokenExpires = undefined);
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('there was an error sending in email. try again later', 500),
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  //1.get User based on token
  console.log('reset token:', req.query.token);
  // it can be in params allso req.params.token to this pass this in routes /:token
  // console.log('reset token:', req.params.token);

  const hasedToken = crypto
    .createHash('sha256')
    .update(req.query.token)
    .digest('hex');
  console.log('hashedToken', hasedToken);
  const user = await User.findOne({
    passwordResetToken: hasedToken,
    // passwordResetTokenExpires: {
    //   $lt: Date.now(),
    // },
  });
  console.log(user);
  console.log(hasedToken);
  //2.if token has not expired, and there is user,set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordCofirm = req.body.passwordCofirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();
  //3.update changedPasswordAt property for the user

  //4.Log the user in , send JWT
  createSendToken(user, 201, res );
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1.get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2.check if posted current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }
  // 3.if so then update password
  user.password = req.body.password;
  user.passwordCofirm = req.body.passwordCofirm;
  await user.save();
  //here user.findByIdAndUpdate will not work as intended
  // 4. log user in ,send jwt
  createSendToken(user, 201, res,"updated successfully");
});
