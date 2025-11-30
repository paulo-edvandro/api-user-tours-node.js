const mongoose = require('mongoose');
const Tour = require('../model/toursModel');
const User = require('../model/usersModel');

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: Tour,
    required: [true, 'Uma reserva deve ter um tour'],
  },

  user: {
    type: mongoose.Schema.ObjectId,
    ref: User,
    required: [true, 'Uma reserva deve ter um usuário'],
  },

  price: {
    type: Number,
    required: [true, 'Uma reserva deve ter um preço'],
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },

  paid: {
    type: Boolean,
    default: true,
  },
});

bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name',
  });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
