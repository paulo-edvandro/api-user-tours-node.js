const Tour = require('../model/toursModel');
const User = require('../model/usersModel');
const Booking = require('../model/bookingsModel');
const { error } = require('console');
const catchAsync = require('../utils/catchAsync');
const handlerFactory = require('./handlerFactory');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
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
            images: [
              `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`,
            ],
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

exports.createBookingCheckout = async (session) => {
  const tour = session.client_reference_id;
  const user = await User.findOne({ email: session.customer_email });
  const price = session.amount_total / 100;
  await Booking.create({ tour, user, price });
};

exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return res.status(400).send(`webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    exports.createBookingCheckout(event.data.object);
  }

  res.status(200).json({ received: true });
};
exports.getAllBooking = handlerFactory.getAllSimple(Booking);

exports.getBooking = handlerFactory.getOne(Booking);

exports.addNewBooking = handlerFactory.createOne(Booking);

exports.updateBooking = handlerFactory.updateOne(Booking);

exports.deleteBooking = handlerFactory.deleteOne(Booking);
