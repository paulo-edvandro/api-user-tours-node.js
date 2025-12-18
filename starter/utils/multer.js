const multer = require('multer');
const AppError = require('./AppError');

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

exports.upload = upload;
