const Review = require('../Model/reviewModel');
const factory = require('./handlerFactory');
// const catchAsync = require('../utils/catchAsync');

// catchAsync(async (req, res, next) => {
  //   let filter = {};
  //   if (req.params.tourId) filter = { tour: req.params.tourId };
  //   const Reviews = await Review.find(filter);
//   res.status(200).json({
  //     status: 'success',
//     results: Reviews.length,
//     data: { Reviews },
//   });
// });
exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
// exports.createReview = catchAsync(async (req, res, next) => {
  //   const newReview = await Review.create(req.body);
  //   res.status(201).json({
//     status: 'success',
//     data: { newReview },
//   });
// });
exports.getAllReviews = factory.getAll(Review);
exports.getReviews = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.deleteReviews = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
