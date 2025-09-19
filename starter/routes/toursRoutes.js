const express = require('express');

const toursController = require('../controllers/toursController');
const autenticationsController = require('../controllers/autenticationsController');

const router = express.Router();

router
  .route('/top-5-cheap')
  .get(toursController.aliasTopTours, toursController.getAllTours);

router.route('/stats').get(toursController.getToursStats);

router.route('/mes-mais-tours/:year').get(toursController.getMonthlyPlan);

router
  .route('/')
  .get(autenticationsController.protectionToken, toursController.getAllTours)
  .post(toursController.addNewTour);

router
  .route('/:id')
  .get(toursController.getTour)
  .patch(toursController.updateTour)
  .delete(
    autenticationsController.protectionToken,
    autenticationsController.restrictTo('admin', 'lead-guide'),
    toursController.deleteTour,
  );

module.exports = router;
