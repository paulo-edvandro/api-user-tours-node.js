// const express = require('express');
// const mongoose = require('mongoose');
const User = require('../model/usersModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const UserFeatures = require('../utils/usersFeatures');
const handlerFactory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'starter/public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user._id}-${Date.now()}.${ext}`);
//   },
// });

//irá armazenar no req.file.buffer para podermos usar para mexer na imagem e depois enviar para algum canto
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError(400, 'Apenas imagens são permitidas para upload'), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadUserPhoto = upload.single('photo');
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
  console.log('🔎 updateMe called:', req.method, req.originalUrl);
  console.log('🔎 updateMe body:', req.body);
  console.log('UPATEME AQUI');
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
