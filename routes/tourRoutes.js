const express = require('express');

const tourcontroller = require('./../controller/tourController');
const router = express.Router();
const authController = require('./../controller/authController');
//router.param('id',tourcontroller.checkID);
router.route('/top-5-cheap').get(tourcontroller.aliasTopTours, tourcontroller.getAllTour)

router.route('/monthly-plan/:year').get(tourcontroller.getMonthlyPlan);
router.route('/tour-stats').get(tourcontroller.getTourStats);
router.route('/').get(authController.protect,  tourcontroller.getAllTour).post(tourcontroller.createTour);
router.route('/:id').get(tourcontroller.getTour).patch(tourcontroller.updateTour).delete(authController.protect, authController.restrictTo('admin', 'lead-guid'), tourcontroller.deleteTour);


module.exports = router; 