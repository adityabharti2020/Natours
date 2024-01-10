const express = require('express');
const tourController = require('../Controller/tourController');
const authController = require('../Controller/authController')
// const {getAlltours,createTour,getTour,deleteTour} = require('../Controller/tourController');
const Router = express.Router();
// Router.param('id', tourController.checkId);
// Router.param('id', tourController.checkbody);
Router.route('/top-5-cheap').get(tourController.aliasTopTours,tourController.getAlltours);
Router.route('/tour-stats').get(tourController.getTourStats);
Router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
Router.route('/')
  .get(authController.protect,tourController.getAlltours)
  .post(tourController.createTour);
  // .post(tourController.checkbody,tourController.createTour);
Router.route('/:id')
  .get(tourController.getTour)
  .delete(authController.protect,authController.restrictTo("admin","lead-guide"),tourController.deleteTour); //here admi is role of user
Router.route('/:id').patch(tourController.updateTour);

module.exports = Router;
