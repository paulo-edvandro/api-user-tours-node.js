const express = require('express');

const Tour = require('../model/toursModel');
const Booking = require('../model/bookingsModel');
const { error } = require('console');
const TourFeatures = require('../utils/toursFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const handlerFactory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');
const multerUtil = require('../utils/multer');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);
  const host = '127.0.0.1:8000';
  // DEPOIS USAR req.get('host')

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${req.protocol}://${host}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${host}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: 'brl',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`http://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
        quantity: 1,
      },
    ],
  });
  res.status(200).json({
    status: 'success',
    session,
  });
});
exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  //TEMPORARIO E NÃO SEGURO, POIS TODOS PODERIAM FAZER RESERVA/BOOKING SEM PAGAR, BASTA COLOCAR AS INFORMAÇÕES DO BOOKING NO OVERVIEW;

  const { tour, user, price } = req.query;

  if (!tour && !user && !price) {
    return next();
  }

  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});

exports.getAllBooking = handlerFactory.getAllSimple(Booking);

exports.getBooking = handlerFactory.getOne(Booking);

exports.addNewBooking = handlerFactory.createOne(Booking);

exports.updateBooking = handlerFactory.updateOne(Booking);

exports.deleteBooking = handlerFactory.deleteOne(Booking);
