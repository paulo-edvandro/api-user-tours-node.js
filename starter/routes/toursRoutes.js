const express = require('express');

const toursController = require('../controllers/toursController');
const reviewsController = require('../controllers/reviewsController');
const authenticationController = require('../controllers/authenticationController');
const reviewsRouter = require('./reviewsRoutes');
const router = express.Router();

router.use('/:tourId/reviews', reviewsRouter);

router
  .route('/tours-within/:distance/center/:latlong/unit/:unit')
  .get(toursController.getToursWithin);
//poderia ser /tours-distance?distance=233$center=40,45$unit=km ;
//Mas padrão hoje é utilizar opções
router
  .route('/distances/:latlong/unit/:unit')
  .get(toursController.getToursDistances);
router
  .route('/top-5-cheap')
  .get(toursController.aliasTopTours, toursController.getAllTours);

router.route('/stats').get(toursController.getToursStats);

router
  .route('/mes-mais-tours/:year')
  .get(
    authenticationController.protectionToken,
    authenticationController.restrictTo('admin', 'lead-guide'),
    toursController.getMonthlyPlan,
  );

router
  .route('/')
  .get(toursController.getAllTours)
  .post(
    authenticationController.protectionToken,
    authenticationController.restrictTo('admin', 'lead-guide'),
    toursController.addNewTour,
  );

router
  .route('/:id')
  .get(toursController.getTour)
  .patch(
    authenticationController.protectionToken,
    authenticationController.restrictTo('admin', 'lead-guide'),
    toursController.updateTour,
  )
  .delete(
    authenticationController.protectionToken,
    authenticationController.restrictTo('admin', 'lead-guide'),
    toursController.deleteTour,
  );

module.exports = router;
