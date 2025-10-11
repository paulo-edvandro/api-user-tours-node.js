const express = require('express');
const reviewsController = require('../controllers/reviewsController');
const authenticationController = require('../controllers/authenticationController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(
    authenticationController.protectionToken,
    authenticationController.restrictTo('user'),
    reviewsController.addNewReview,
  )
  .get(reviewsController.getAllReviews);

module.exports = router;
