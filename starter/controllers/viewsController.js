const Tour = require('../model/toursModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('../model/usersModel');


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
