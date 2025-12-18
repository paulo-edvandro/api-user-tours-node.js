// const express = require('express');
// const mongoose = require('mongoose');
const User = require('../model/usersModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const UserFeatures = require('../utils/UsersFeatures');
const handlerFactory = require('./handlerFactory');
const sharp = require('sharp');
const multerUtil = require('../utils/multer');

exports.uploadUserPhoto = multerUtil.upload.single('photo');
exports.resizeUserPhoto = async (req, res, next) => {
  if (req.file) {
    req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`starter/public/img/users/${req.file.filename}`);
  }
  next();
};

exports.resizeUserPhotoForSignup = async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${Date.now()}-${Math.round(
    Math.random() * 1e9,
  )}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`starter/public/img/users/${req.file.filename}`);

  req.body.photo = req.file.filename;

  next();
};
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

  if (req.file) {
    filteredBody.photo = req.file.filename;
  }

  const updateUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: 'success', data: { user: updateUser } });
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

  res.status(204).json({ status: 'success', data: null });
});

exports.deleteUser = handlerFactory.deleteOne(User);
