const mongoose = require('mongoose');
const Tour = require('../model/toursModel');
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'O review deve ter algum conteúdo'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'O review deve ter uma avaliação'],
    },
    createdAt: { type: Date, default: Date.now },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'o review deve ter um tour '],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'o review deve ter um user '],
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.statics.calcAverageRatingTour = async function (tourId) {
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcAverageRatingTour(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.review = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  if (this.review) {
    await this.review.constructor.calcAverageRatingTour(this.review.tour);
  }
});

reviewSchema.pre(/^find/, function (next) {
  if (this.options.skipPopulate !== true) {
    this.populate({
      path: 'user',
      select: 'username photo',
    });
    // .populate({
    //   path: 'tour',
    //   select: 'name',
    // });
  }
  next();
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
