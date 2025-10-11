const Review = require('../model/reviewsModel');
const { findOne } = require('../model/usersModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const ReviewsFeatures = require('../utils/ReviewsFeatures');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  if (req.params.tourId) {
    req.query.tour = req.params.tourId;
  }

  const queryFeatures = await new ReviewsFeatures(req.query, Review)
    .convertOperators()
    .buildMongoQuery()
    .sortDocuments()
    .filterFields()
    .applyPagination()
    .checkPageExists();

  const reviews = await queryFeatures.mongoQuery;

  res
    .status(200)
    .json({ status: 'success', results: reviews.length, data: { reviews } });
});

exports.addNewReview = catchAsync(async (req, res, next) => {
  const reviews = await Review.create({
    review: req.body.review,
    rating: req.body.rating,
    user: req.user._id,
    tour: req.params.tourId,
  });
  res.status(201).json({ status: 'success', data: reviews });
});


