const express = require('express');
const reviewController = require('../Controller/reviewController');
const authController = require('../Controller/authController');
const Router = express.Router({ mergeParams: true });
// POST/tour/tourId/reviews
// GET/tour/tourId/reviews
// GET/tour/tourId/reviews/reviewsId
Router.route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview,
  );
Router.route('/:id').delete(reviewController.deleteReviews);
module.exports = Router;
