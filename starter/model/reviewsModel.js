const mongoose = require('mongoose');
const ReviewSchema = new mongoose.Schema({});

const Review = new mongoose.Model('Review', ReviewSchema);
module.exports = Review;
