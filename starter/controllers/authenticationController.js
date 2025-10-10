const User = require('../model/usersModel');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { promisify } = require('util');
const { verify } = require('crypto');
const sendEmail = require('../utils/email');
const crypto = require('crypto');
function jwtSign(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
}

function createAndSendToken(
  user,
  res,
  statusCode,
  sendUser = false,
  message = undefined,
) {
  const token = jwtSign(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_EXPIRES_COOKIE * 24 * 60 * 60 * 1000,
    ),
    // secure: true,
    httpOnly: true,
    sameSite: 'Lax',
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  user.password = undefined;
  res.cookie('jwt', token, cookieOptions);
  const resBody = { status: 'sucess', message };
  if (sendUser) {
    resBody.data = user;
  }
  res.status(statusCode).json(resBody);
}
// const UserFeatures = require('../utils/usersFeatures');
exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });

  user.password = undefined;

  createAndSendToken(user, res, 201, true);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError(400, 'email ou senha devem ser preenchidos'));
  }

  const user = await User.findOne({ email }).select('password');

  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new AppError(401, 'Email ou senha estão incorretos!'));
  }

  createAndSendToken(user, res, 200);
});

exports.protectionToken = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError(401, 'Acesso não permitido! Por favor, faça login'),
    );
  }
  //usar o promisify por causa do await. jew.verify foi criado com o modelo antigo callback, então por ser assincrono (await tbm é , porém mais bem estruturado),
  // o codigo posterior é rodado enquanto ele carrega e , por isso, todo o codigo dependente dele tem que ficar dentro do callback;
  // exemplo: console.log(decoded) teria que ficar no callback dele;
  // como não queremos ir por esse meio já que estamos sempre usando o modelo mais clean async/await a gente usa o promisify
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //agora podemos usar de boa o decoded e todo o codigo relacionado a ele fora, sem ser dentro do callback, com o modelo baseado em promise armazenado em variavel
  console.log(decoded);

  const user = await User.findOne({ _id: decoded.id });

  if (!user) {
    return next(
      new AppError(401, 'Acesso expirado! Por favor, faça login novamente!'),
    );
  }

  if (user.checkPasswordChanged(decoded.iat)) {
    return next(
      new AppError(
        401,
        'A senha foi alterada! Por favor, faça login novamente!',
      ),
    );
  }

  req.user = user;
  next();
});
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (roles.includes(req.user.role)) {
      next();
    } else {
      return next(
        new AppError(403, 'Este usuário não tem permição para fazer isso'),
      );
    }
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError(400, 'Este email não existe!'));
  }

  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${resetToken}`;

  const message = `Esqueceu sua senha? clique nesse link e atualize sua senha: ${resetURL}.\nSe você não esqueceu sua senha, por favor, ignore este email!`;

  try {
    await sendEmail({
      email: user.email,
      message: message,
      subject: 'Token de recuperação de senha (válido por 10 minutos)',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(500, 'Erro ao enviar o email. Tente novamente mais tarde!'),
    );
  }

  res
    .status(200)
    .json({ status: 'sucess', message: 'Token enviado para o email!' });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //poderiamos refatorar e deixar isso em uma função, mas por enquanto, vamos deixar assim mesmo
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  //A unica maneira de sabermos quem é o user aqui é através do token cru que enviamos na Url dele para identificar
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError(401, 'Token inválido ou expirado!'));
  }
  if (Date.now() > user.passwordResetExpires) {
    return next(
      new AppError(
        401,
        'O token expirou! Por favor, peça a solicitação de redefinição de senha novamente!',
      ),
    );
  }

  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  createAndSendToken(user, res, 200);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ _id: req.user._id }).select('+password');

  //OUTRO JEITO DE FAZER SERIA:
  // 1 PEGA O ID DO USUÁRIO POR MEIO DO SEU TOKEN
  // const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // 2 BUSCA O USUÁRIO DE ACORDO COM ESSE ID
  // const user = User.findOne({ _id: decoded.id }).select('+password');
  // 3 PORÉM , JÁ FIZEMOS ISSO NO PROTECTION TOKEN GERANDO O REQ.USER , ENTÃO NÃO PRECISA FAZER DE NOVO;
  // OBS: PODERIA FAZER TUDO USANDO O REQ.USER E NÃO FAZER BUSCA NENHUMA DE USUÁRIO NO FINDONE;
  // PORÉM PARA FAZER ISSO EU TERIA QUE FAZER .select('+password'); NO REQ.USER DO PROTECTIONTOKEN DEIXANDO A SENHA NO OBJETO, ISSO EM SI NÃO TEM PROBLEMA NENHUM,
  // PORÉM EU NÃO ME LEMBRO SE EM ALGUMA ROTA EU ENVIEI REQ.USER PARA O USUÁRIO COMO RESPOSTA, SE TIVER FEITO ISSO IRIA VAZAR SENHA;
  // MAS NÃO TENHO TEMPO DE PROCURAR SÓ POR ISSO, ENTÃO FAZEMOS ASSIM MESMO E TAMBÉM IRÁ FUNCIONAR SEM PROBLEMAS NENHUM;
  // Só Nunca faça res.json({ user }) com esse user que tem password selecionado.

  if (!(await user.checkPassword(req.body.currentPassword, user.password))) {
    return next(new AppError(401, 'Senha incorreta, tente novamente!'));
  }

  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  await user.save();

  console.log({
    passwordChangedAt: user.passwordChangedAt,
    agora: Date.now(),
  });
  createAndSendToken(user, res, 200);
});
