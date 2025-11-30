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

const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      err,
      stack: err.stack,
    });
  }

  // WEBSITE
  return res.status(err.statusCode).render('error', {
    title: 'Algo deu errado!',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    console.error('BUG NO CODIGO!!!', err);

    return res.status(500).json({
      status: 'error',
      message: 'Algo deu errado!',
    });
  }

  // WEBSITE
  return res.status(err.statusCode).render('error', {
    title: 'Algo deu errado!',
    msg: 'Por favor tente novamente mais tarde',
  });
};

module.exports = (err, req, res, next) => {
  console.log(Object.keys(err));
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    return sendErrorDev(err, req, res);
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
    error.message = err.message;
    error.stack = err.stack;

    if (handlers) {
      const transformedError = handlers(error);
      transformedError.stack = err.stack;
      return sendErrorProd(transformedError, req, res);
    }
    return sendErrorProd(error, req, res);
  }
};
