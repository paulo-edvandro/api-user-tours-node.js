const Review = require('../model/reviewsModel');
const { findOne } = require('../model/usersModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const ReviewFeatures = require('../utils/ReviewsFeatures');
const handlerFactory = require('./handlerFactory');

exports.setTourQuery = (req, res, next) => {
  if (req.params.tourId) {
    req.query.tour = req.params.tourId;
  }
  next();
};
exports.getAllReviews = handlerFactory.getAll(Review, ReviewFeatures);

exports.addNewReview = handlerFactory.createOne(Review, (req) => ({
  review: req.body.review,
  rating: req.body.rating,
  user: req.user._id,
  tour: req.params.tourId,
}));
exports.deleteReview = handlerFactory.deleteOne(Review);
exports.updateReview = handlerFactory.updateOne(Review);
exports.getReview = handlerFactory.getOne(Review, false);
