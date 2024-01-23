const express = require('express');
const reviewController = require('../Controller/reviewController');
const authController = require('../Controller/authController');
const Router = express.Router({ mergeParams: true });
// POST/tour/tourId/reviews
// GET/tour/tourId/reviews
// GET/tour/tourId/reviews/reviewsId
Router.use(authController.protect);
Router.route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview,
  );
Router.route('/:id').delete(
  authController.restrictTo('user', 'admin'),
  reviewController.deleteReviews,
);
Router.route('/:id').patch(
  authController.restrictTo('user', 'admin'),
  reviewController.updateReview,
);
Router.route('/:id').get(reviewController.getReviews);
module.exports = Router;
