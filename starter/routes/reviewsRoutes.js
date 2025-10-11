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
  .get(reviewsController.setTourQuery, reviewsController.getAllReviews);

router
  .route('/:id')
  .delete(reviewsController.deleteReview)
  .patch(reviewsController.updateReview);

router.route('/getreview').get(reviewsController.getReview);

module.exports = router;
