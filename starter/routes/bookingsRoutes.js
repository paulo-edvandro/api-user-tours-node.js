const express = require('express');
const bookingController = require('../controllers/bookingsController');
const authenticationController = require('../controllers/authenticationController');

const router = express.Router({ mergeParams: true });

router
  .route('/checkout-session/:tourId')
  .get(
    authenticationController.protectionToken,
    bookingController.getCheckoutSession,
  );

module.exports = router;
