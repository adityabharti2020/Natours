const express = require('express');
const tourController = require('../Controller/tourController');
// const {getAlltours,createTour,getTour,deleteTour} = require('../Controller/tourController');
const Router = express.Router();
// Router.param('id', tourController.checkId);
// Router.param('id', tourController.checkbody);
Router.route('/top-5-cheap').get(tourController.aliasTopTours,tourController.getAlltours);
Router.route('/tour-stats').get(tourController.getTourStats);
Router.route('/')
  .get(tourController.getAlltours)
  .post(tourController.createTour);
  // .post(tourController.checkbody,tourController.createTour);
Router.route('/:id')
  .get(tourController.getTour)
  .delete(tourController.deleteTour);
Router.route('/:id').patch(tourController.updateTour);

module.exports = Router;
