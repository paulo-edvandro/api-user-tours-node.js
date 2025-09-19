const express = require('express');

const Tour = require('../model/toursModel');
const { error } = require('console');
const TourFeatures = require('../utils/toursFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

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
exports.getAllTours = catchAsync(async (req, res, next) => {
  const queryFeatures = await new TourFeatures(req.query, Tour)
    .deleteControlFields()
    .convertOperators()
    .buildMongoQuery()
    .sortDocuments()
    .filterFields()
    .applyPagination()
    .checkPageExists();

  const tours = await queryFeatures.mongoQuery;

  res
    .status(200)
    .json({ status: 'sucess', results: tours.length, data: { tours } });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  if (!tour) {
    return next(new AppError(404, 'Nenhum tour com esse Id'));
  }
  res.status(200).json({ status: 'sucess', data: { tour } }); // Exemplo de retorno temporário
});

exports.addNewTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({ status: 'success', data: { tour: newTour } }); // Exemplo de retorno temporário
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError(404, 'Nenhum tour com esse Id'));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError(404, 'Nenhum tour com esse Id'));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

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

// module.exports = {
//   getAllTours,
//   getTour,
//   addNewTour,
//   updateTour,
//   deleteTour,
//   aliasTopTours,
//   getToursStats
// };
