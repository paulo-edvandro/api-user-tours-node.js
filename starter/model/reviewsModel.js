const mongoose = require('mongoose');
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

const Review = new mongoose.Model('Review', reviewSchema);
module.exports = Review;
