const express = require('express');
const reviewsController = require('../controllers/reviewsController');
const authenticationController = require('../controllers/authenticationController');

const router = express.Router({ mergeParams: true });
router.use(authenticationController.protectionToken);
router
  .route('/')
  .post(
    authenticationController.restrictTo('user'),
    reviewsController.addNewReview,
  )
  .get(reviewsController.setTourQuery, reviewsController.getAllReviews);

router
  .route('/:id')
  .delete(
    authenticationController.restrictTo('user', 'admin'),
    reviewsController.deleteReview,
  )
  .patch(
    authenticationController.restrictTo('user', 'admin'),
    reviewsController.updateReview,
  )
  .get(
    authenticationController.restrictTo('user', 'admin'),
    reviewsController.getReview,
  );

module.exports = router;
