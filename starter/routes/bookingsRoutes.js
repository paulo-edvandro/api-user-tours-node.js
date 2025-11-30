const express = require('express');
const bookingsController = require('../controllers/bookingsController');
const authenticationController = require('../controllers/authenticationController');

const router = express.Router({ mergeParams: true });

router.use(authenticationController.protectionToken);
router
  .route('/checkout-session/:tourId')
  .get(bookingsController.getCheckoutSession);

router.use(authenticationController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingsController.getAllBooking)
  .post(bookingsController.addNewBooking);

router
  .route('/:id')
  .get(bookingsController.getBooking)
  .patch(bookingsController.updateBooking)
  .delete(bookingsController.deleteBooking);

module.exports = router;
