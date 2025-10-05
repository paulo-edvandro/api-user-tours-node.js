const express = require('express');
const fs = require('fs');
const usersController = require('../controllers/usersController');
const autenticationsController = require('../controllers/autenticationsController');

const router = express.Router();

router.route('/signup').post(autenticationsController.signup);
router.route('/login').post(autenticationsController.login);
router.route('/forgotpassword').post(autenticationsController.forgotPassword);
router
  .route('/resetpassword/:token')
  .patch(autenticationsController.resetPassword);
router
  .route('/updatepassword')
  .patch(
    autenticationsController.protectionToken,
    autenticationsController.updatePassword,
  );

router
  .route('/updateme')
  .patch(autenticationsController.protectionToken, usersController.updateMe);
router
  .route('/deleteme')
  .delete(autenticationsController.protectionToken, usersController.deleteMe);
// .post(usersController.addNewUser);
router.route('/').get(usersController.getAllUsers);

router
  .route('/:id')
  .get(usersController.getUser)
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser);

module.exports = router;
