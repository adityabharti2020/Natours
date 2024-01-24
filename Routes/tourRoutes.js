const express = require('express');
const tourController = require('../Controller/tourController');
const authController = require('../Controller/authController');
const reviewRoutes = require('../Routes/reviewRoutes');

const Router = express.Router();

// POST/tour/tourId/reviews
// GET/tour/tourId/reviews
// GET/tour/tourId/reviews/reviewsId
// Router.route('/:tourId/reviews').post(
//   authController.protect,
//   authController.restrictTo('user'),
//   reviewController.createReview,
// );
Router.use('/:tourId/reviews', reviewRoutes);
// Router.param('id', tourController.checkId);
// Router.param('id', tourController.checkbody);
Router.route('/top-5-cheap').get(
  tourController.aliasTopTours,
  tourController.getAlltours,
);
Router.route('/tour-stats').get(tourController.getTourStats);
Router.route('/monthly-plan/:year').get(
  authController.protect,
  authController.restrictTo('admin', 'lead-guide', 'guide'),
  tourController.getMonthlyPlan,
);
// /tour-distance?distance=233,center=-40,45,unit=mi
// /tour-distance/233/center/-40,45/unit/mi
Router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(
  tourController.getToursWithIn,
);
// to measure the distance from the certain point to the others tours
Router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);
// we can type in postman in the place of unit mi or km
Router.route('/')
  .get(tourController.getAlltours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour,
  );
// .post(tourController.checkbody,tourController.createTour);
Router.route('/:id')
  .get(tourController.getTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour,
  ); //here admi is role of user
Router.route('/:id').patch(
  authController.protect,
  authController.restrictTo('admin', 'lead-guide'),
  tourController.updateTour,
);

module.exports = Router;
