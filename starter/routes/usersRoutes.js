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
router.route('/').get(usersController.getAllUsers);
// .post(usersController.addNewUser);

router
  .route('/:id')
  .get(usersController.getUser)
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser);

module.exports = router;
