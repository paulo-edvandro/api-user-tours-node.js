const express = require('express');

const Tour = require('../model/toursModel');
const { error } = require('console');
const TourFeatures = require('../utils/toursFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const handlerFactory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');
const multerUtil = require('../utils/multer');

exports.uploadTourImages = multerUtil.upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourImages = async (req, res, next) => {
  //bem importante e evita que os horarios saiam diferentes no imageCover e images
  const timestamp = Date.now();

  if (req.files.imageCover) {
    req.body.imageCover = `tour-${req.params.id}-${timestamp}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`starter/public/img/tours/${req.body.imageCover}`);
  }

  if (req.files.images) {
    req.body.images = await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `tour-${req.params.id}-${timestamp}-${i + 1}.jpeg`;

        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`starter/public/img/tours/${filename}`);

        return filename;
      }),
    );
  }

  next();
};

// const { buscarTourPorId } = require('../helpers-function/helpers');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8'),
// );

// const checkPropertyReqBody = (req, res, next) => {
//   const propriedades = ['name', 'price'];

//   if (!propriedades.every((prop) => Object.hasOwn(req.body, prop)))
//     return res
//       .status(400)
//       .json({ status: 'fail', message: 'faltando o preço ou nome' });

//   next();
// };
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'ratingsAverage,price';
  req.query.fields = 'name,price,difficulty,ratingsAverage,summary';

  next();
};

//SERVE PARA EXIBIR TODOS OS TOURS DE UMA DETERMINADA ROTA, NÃO IMPORTA QUAL SEJA;
exports.getAllTours = handlerFactory.getAll(Tour, TourFeatures);

exports.getTour = handlerFactory.getOne(Tour, { path: 'reviews' });

exports.addNewTour = handlerFactory.createOne(Tour);

exports.updateTour = handlerFactory.updateOne(Tour);

exports.deleteTour = handlerFactory.deleteOne(Tour);

exports.getToursStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },

    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },

        numRating: { $sum: '$ratingsQuantity' },
        avgPrice: { $avg: '$price' },
        avgRatings: { $avg: '$ratingsAverage' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },

    {
      $sort: { avgAverage: 1 },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lt: new Date(`${year + 1}-01-01`),
        },
      },
    },

    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },

    {
      $project: {
        _id: 0,
      },
    },

    {
      $sort: { numTours: -1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlong, unit } = req.params;

  const [lat, long] = latlong.split(',');

  if (!lat || !long) {
    next(
      new AppError(
        400,
        'Por favor, envie latitude e longitude no formato lat,lng',
      ),
    );
  }

  //opções disponiveis : 'mi' ou 'km'
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[long, lat], radius] } },
  });

  res
    .status(200)
    .json({ status: 'success', results: tours.length, data: { data: tours } });
});

exports.getToursDistances = catchAsync(async (req, res, next) => {
  const { latlong, unit } = req.params;

  const [lat, long] = latlong.split(',');

  if (!lat || !long) {
    next(
      new AppError(
        400,
        'Por favor, envie latitude e longitude no formato lat,lng',
      ),
    );
  }
  
  const multiplier = unit === 'km' ? 0.001 : 0.000621371;

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [long * 1, lat * 1] },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    { $project: { name: 1, distance: 1 } },
  ]);

  res.status(200).json({ status: 'success', data: { data: distances } });
});

// module.exports = {
//   getAllTours,data
//   getTour,
//   addNewTour,
//   updateTour,
//   deleteTour,
//   aliasTopTours,
//   getToursStats
// };
