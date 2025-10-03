// const express = require('express');
// const mongoose = require('mongoose');
const User = require('../model/usersModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const UserFeatures = require('../utils/usersFeatures');

const filterObj = (req, ...allowedFields) => {
  const object = {};

  Object.keys(req.body).forEach((element) => {
    if (allowedFields.includes(element)) {
      object[element] = req.body[element];
    }
  });

  return object;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const queryFeatures = await new UserFeatures(req.body, User)
    .deleteControlFields()
    .convertOperators()
    .buildMongoQuery()
    .sortDocuments()
    .filterFields()
    .applyPagination()
    .checkPageExists();

  const users = await queryFeatures.mongoQuery;

  res.status(200).json({ status: 'sucess', data: users });
});
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError(404, 'id de usuário inválido'));
  }

  res.status(200).json({ status: 'sucess', data: user });
});
// exports.addNewUser = catchAsync(async (req, res, next) => {
//   const newUser = await User.create(req.body);

//   res.status(201).json({ status: 'sucess', data: newUser });
// });
exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(new AppError(404, 'id de usuário inválido'));
  }
  res.status(200).json({ status: 'sucess', data: user });
});
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return next(new AppError(404, 'id de usuário inválido'));
  }
  res.status(204).json({ status: 'sucess', data: null });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        400,
        'Esta rota não é para atualização de senha. Por favor, use /updatepassword',
      ),
    );
  }
  const filteredBody = filterObj(req, 'name', 'username', 'email');

  const updateUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: 'sucess', data: { user: updateUser } });
});
