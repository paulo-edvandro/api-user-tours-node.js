const express = require('express');
const viewsController = require('../controllers/viewsController');
//armazenará a nossa rota para colocarmos no app.use no app.js
const router = express.Router();
const authenticationController = require('../controllers/authenticationController');
const bookingsController = require('../controllers/bookingsController');

// app.get("/tour", (req, res) => {
//   res.status(200).render("tour", { title: "tour" });
// });
router.get('/login', viewsController.getLogin);

router.get(
  '/',
  bookingsController.createBookingCheckout,
  authenticationController.isLoginIn,
  viewsController.getOverview,
);
router.get(
  '/tour/:slug',
  authenticationController.isLoginIn,
  viewsController.getTour,
);

router.get(
  '/me',
  authenticationController.protectionToken,
  viewsController.getAccount,
);

router.get(
  '/my-tours',
  authenticationController.protectionToken,
  viewsController.getMyTours,
);

router.get('/signup', viewsController.getSignup);

router.post(
  '/submit-user-data',
  authenticationController.protectionToken,
  viewsController.updateUserData,
);
module.exports = router;
