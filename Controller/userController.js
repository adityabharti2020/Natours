const User = require('../Model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  console.log('in get all user');
  // const queryString = Tour.find().where('duration').equals(5).where('difficulty').equals('easy')
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});
exports.updateMe = catchAsync(async (req, res, next) => {
  //  1.Create error if the user post the password data
  if (req.body.password || req.body.passwordCofirm) {
    return next(
      new AppError(
        'This rote is not for password update! Please use updateMyPassword route',
        400,
      ),
    );
  }
  // 2.Update user document
  const filteredBody = filterObj(req.body, 'name', 'email');
  // filteredBody use to eleminate the secure field like role and resetToken to  update.
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: updatedUser,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'Your account is deactivated successfully',
    data: null,
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this rote is not yet defined',
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this rote is not yet defined',
  });
};
exports.deleteUser = factory.deleteOne(User)
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this rote is not yet defined',
  });
};
