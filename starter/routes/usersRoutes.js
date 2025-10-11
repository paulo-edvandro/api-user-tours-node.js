const express = require('express');
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

//aplica em todo o resto o protectionToken , funciona, pois router.use() é, na verdade, um middlewware
router.use(authenticationController.protectionToken);

router.route('/updatepassword').patch(authenticationController.updatePassword);

router.route('/updateme').patch(usersController.updateMe);
router.route('/deleteme').delete(usersController.deleteMe);
router.route('/me').get(usersController.getMe, usersController.getUser);

//usando de novo router.use para aplicar aos demais a restrição de admin
router.use(authenticationController.restrictTo('admin'));

router.route('/').get(usersController.getAllUsers);

router
  .route('/:id')
  .get(usersController.getUser)
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser);

module.exports = router;
