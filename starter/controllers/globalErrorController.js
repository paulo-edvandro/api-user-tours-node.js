//TRATAMENTOS DE ERROS DOS QUE VEM PARA CÁ, DOS QUE O MONGGOSE GERA POR SI MESMO E DAS FALHAS DE PROGRAMAÇÃO DENTRO DE MIDDLEWARES

const AppError = require('../utils/appError');
const { formatDistanceToNow } = require('date-fns');
const { ptBR } = require('date-fns/locale');

const handlerJwtInvalid = (err) => {
  const message = `Acesso não permitido! Por favor, faça login`;
  return new AppError(401, message);
};

const handlerJwtExpired = (err) => {
  const expirationToken = err.expiredAt;

  const expirationTime = formatDistanceToNow(expirationToken, { locale: ptBR });

  const message = `Sua sessão expirou há ${expirationTime}. Faça login de novo!`;
  return new AppError(401, message);
};


const handlerCastErrors = (error) => {
  const message = `O valor ${error.value} está incorreto para o campo ${error.path}`;

  return new AppError(400, message);
};

const handlerDuplicateFields = (error) => {
  const nameAndValue = Object.entries(error.keyValue)
    .map(([prop, value]) => {
      return `${prop}: ${value}`;
    })
    .join(', ');

  const message = `os seguintes campos já estão em uso: ${nameAndValue}`;

  return new AppError(400, message);
};

const handlerValidationErrors = (error) => {
  const msgsErrorsValidators = Object.keys(error.errors)
    .map((key) => error.errors[key].message)
    .join('. ');

  const message = `Data inválida: ${msgsErrorsValidators}`;

  return new AppError(400, message);
};

const sendErrorDev = (err, res, req, next) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    err: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res, req, next) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('BUG NO CODIGO!!!', err);

    res.status(500).json({
      status: 500,
      message: 'algo deu errado',
    });
  }
};

module.exports = (err, req, res, next) => {
  console.log(Object.keys(err));
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  }

  if (process.env.NODE_ENV === 'production') {
    const errorHandlers = {
      CastError: handlerCastErrors,
      11000: handlerDuplicateFields,
      ValidationError: handlerValidationErrors,
      JsonWebTokenError: handlerJwtInvalid,
      TokenExpiredError: handlerJwtExpired,
    };

    //AQUI VAI SER UNDEFINED SE O ERRO FOI ENVIADO POR NÓS MESMOS COMO OPERACIONAL; SÓ APARECERÁ SE FOR ERRO ENVIADO PELO MONGOOSE
    const handlers = errorHandlers[err.name] || errorHandlers[err.code];

    let error = { ...err };

    if (handlers) {
      error = handlers(error);
      return sendErrorProd(error, res);
    }
    return sendErrorProd(err, res);
  }
};
