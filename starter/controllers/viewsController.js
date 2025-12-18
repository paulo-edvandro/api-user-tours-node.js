const Tour = require('../model/toursModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const User = require('../model/usersModel');
const Booking = require('../model/bookingsModel');

exports.alerts = (req, res, next) => {
  const { alert } = req.query;

  if (alert === 'booking') {
    res.locals.alert =
      'Sua reserva foi um sucesso! verifique seu email para uma confirmação! Se sua reserva não apareceu imediatamente, volte aqui mais tarde!';
  }

  next();
};
exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res.status(200).render('overview', { tours, title: 'overview' });
});
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    next(new AppError(404, 'Não há nenhum tour com esse nome'));
  }

  res.status(200).render('tour', { title: `${tour.name} Tour`, tour });
});

exports.getLogin = (req, res, next) => {
  res.status(200).render('login', { title: `login` });
};

exports.getSignup = (req, res, next) => {
  res.status(200).render('signup', { title: `signup` });
};
exports.getAccount = (req, res, next) => {
  res.status(200).render('account', { title: `Account` });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updateUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
      username: req.body.username,
    },
    { new: true, runValidators: true },
  );

  res.status(200).render('account', { title: `Account`, user: updateUser });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({
    user: req.user.id,
  });

  const toursId = bookings.map((el) => el.tour);

  const tours = await Tour.find({
    _id: { $in: toursId },
  });
  res.status(200).render('overview', { title: `My tours`, tours });
});

exports.getResendEmailConfirmation = (req, res) => {
  res.status(200).render('resendEmail', {
    title: 'Reenviar confirmação de e-mail',
    email: req.query.email || '',
  });
};

exports.getEmailConfirmedPage = (req, res) => {
  res.status(200).render('emailConfirmed', {
    title: 'Reenviar confirmação de e-mail',
  });
};

exports.getCheckEmail = (req, res) => {
  res.status(200).render('checkEmail', {
    title: 'Confirme seu e-mail',
    email: req.query.email,
  });
};

exports.getForgotPassword = (req, res) => {
  res.status(200).render('forgotPassword', {
    title: 'Esqueci a Senha',
  });
};

exports.getResetPassword = (req, res) => {
  const { token } = req.params;
  res.status(200).render('resetPassword', {
    title: 'Redefinir Senha',
    token,
  });
};
