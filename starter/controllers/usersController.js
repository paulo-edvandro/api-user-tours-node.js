// const express = require('express');
// const mongoose = require('mongoose');
const User = require('../model/usersModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const UserFeatures = require('../utils/usersFeatures');
const handlerFactory = require('./handlerFactory');

const filterObj = (req, ...allowedFields) => {
  const object = {};

  Object.keys(req.body).forEach((element) => {
    if (allowedFields.includes(element)) {
      object[element] = req.body[element];
    }
  });

  return object;
};

exports.getAllUsers = handlerFactory.getAll(User, UserFeatures);

exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};
exports.getUser = handlerFactory.getOne(User, false);

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

exports.updateUser = handlerFactory.updateOne(User);

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.checkPassword(req.body.password, user.password))) {
    return next(new AppError(401, 'A senha está incorreta'));
  }

  if (req.body.password !== req.body.passwordConfirm) {
    return next(new AppError(400, 'As senhas não estão iguais'));
  }

  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({ status: 'sucess', data: null });
});

exports.deleteUser = handlerFactory.deleteOne(User);
