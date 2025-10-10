const express = require('express');
const reviewsController = require('../controllers/reviewsController');
const authenticationController = require('../controllers/authenticationController');

const router = express.Router();

router.route('/').get(reviewsController.getAllReviews);
router
  .route('/addreview/:tourId')
  .post(
    authenticationController.protectionToken,
    authenticationController.restrictTo('user'),
    reviewsController.addNewReview,
  );
module.exports = router;
