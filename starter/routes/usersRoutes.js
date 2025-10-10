const express = require('express');
const fs = require('fs');
const usersController = require('../controllers/usersController');
const authenticationController = require('../controllers/authenticationController');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const loginLimiter = rateLimit({
  max: 10,
  windowMs: 5 * 60 * 1000,
  message: JSON.stringify({
    status: 'fail',
    message: 'Muitas tentativas de login. Tente novamente em 5 minutos.',
  }),
});

router.route('/signup').post(authenticationController.signup);
router.route('/login').post(loginLimiter, authenticationController.login);
router.route('/forgotpassword').post(authenticationController.forgotPassword);
router
  .route('/resetpassword/:token')
  .patch(authenticationController.resetPassword);
router
  .route('/updatepassword')
  .patch(
    authenticationController.protectionToken,
    authenticationController.updatePassword,
  );

router
  .route('/updateme')
  .patch(authenticationController.protectionToken, usersController.updateMe);
router
  .route('/deleteme')
  .delete(authenticationController.protectionToken, usersController.deleteMe);
// .post(usersController.addNewUser);
router.route('/').get(usersController.getAllUsers);

router
  .route('/:id')
  .get(usersController.getUser)
  .patch(usersController.updateUser);

module.exports = router;
