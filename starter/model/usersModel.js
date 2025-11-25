const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/appError');
const crypto = require('crypto');

const validation1 = /^[a-z0-9._]+$/;
const validation2 = /^(?!.*\.\.).*$/;
const validation3 = /^(?!.*___).*$/;
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'o usuário deve ter um username!'],
    unique: true,
    maxlength: [25, 'o username deve ter no max 25 caracteres'],
    minlength: [3, 'o username deve ter pelo menos 3 caracteres'],
    validate: [
      {
        validator: function (val) {
          return validation1.test(val);
        },
        message:
          'o username deve conter apenas letras minúsculas, números, ponto e underscore',
      },
      {
        validator: function (val) {
          return validation2.test(val);
        },
        message: 'o username não pode conter dois pontos seguidos',
      },
      {
        validator: function (val) {
          return validation3.test(val);
        },
        message: 'o username não pode conter três underscores seguidos',
      },
    ],
  },
  password: {
    type: String,
    required: [true, 'O usuário deve ter uma senha'],
    minlength: [7, 'A senha deve ter pelo menos 7 caracteres'],
    validate: {
      validator: (val) =>
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/.test(val),

      message:
        'A senha deve conter ao menos uma letra minúscula, uma maiúscula, um número e um caractere especial',
    },
    select: false,
  },

  passwordConfirm: {
    type: String,
    required: [true, 'por favor , confirme a sua senha'],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'As senhas não estão iguais.',
    },
  },
  email: {
    type: String,
    required: [true, 'O usuário deve ter um email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Por favor, insira um e-mail válido!'],
  },
  name: {
    type: String,
    maxlength: [25, 'o nome deve ter no max 25 caracteres'],
    minlength: [2, 'o nome deve ter pelo menos 2 caracteres'],
    validate: {
      validator: (val) => /^[a-zA-ZÀ-ÿ'\.-]+(?: [a-zA-ZÀ-ÿ'\.-]+)*$/.test(val),
      message:
        'Use apenas letras minúsculas ou inicie cada palavra com letra maiúscula (Ex: "paulo edvandro" ou "Paulo Edvandro")',
    },
  },

  photo: { type: String, default: 'neyma.jpg' },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'guide', 'lead-guide', 'admin'],
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: { type: Boolean, default: true, select: false },

  //   bank,
  //   age,
  //   description,
  //   formação,
  //   experiencia
});

//PARA MUDANÇAS DE SENHA EM GERAL: APLICA O  HASH E DEFINE O PASSWORDCONFIRM COMO UNDEFINED PARA IR AO BD
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 13);

  this.passwordConfirm = undefined;
  next();
});

//ETAPA ACIONADA PARA REDEFINIÇÕES DE SENHA: DEFINE O PASSWORDCHANGEDAT NO BD
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// userSchema.pre('save', async function (next) {
//   if (this.isModified('password')) {
//     this.passwordChangedAt = Date.now();
//   }
//   next();
// });

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.checkPassword = async function (password, passwordHash) {
  return await bcrypt.compare(password, passwordHash);
};

//VERIFICA SE O PASSWORDCHANGEDAT EXISTE E SE EXISTE VERIFICA SE ELE É MAIOR QUE A EMISSÃO DO TOKEN, SE FOR AI DÁ ERRO
userSchema.methods.checkPasswordChanged = function (jwtEmit) {
  if (!this.passwordChangedAt) return false;
  const changedTimestamp = parseInt(
    this.passwordChangedAt.getTime() / 1000,
    10,
  );
  console.log({ changedTimestamp, jwtEmit });

  return changedTimestamp > jwtEmit;
};

//DEFINE A PROPRIEDADE DO SCHEMA RESETTOKEN E RESETEXPIRES COM O VALOR TEMPORARIO DO TOKEN CRIPTOGRAFADO E DO SEU TEMPO DE EXPIRAÇÃO PARA REDEFINIÇÃO DE SENHA. RETORNA O TOKEN NORMAL SEM O HASH PARA VERIFICAÇÃO NO EMAIL DO USER;
userSchema.methods.createPasswordResetToken = function () {
  const tokenReset = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(tokenReset)
    .digest('hex');

  //ADICIONA UMA DATA DE EXPIRAÇÃO PARA O TOKEN VÁLIDO A PARTIR DA DATA DE AGORA "DATE.NOW()" + 10 * 60 * 1000  QUE É 10 MINUTOS EM MILISEGUNDOS; OU SEJA DANDO UM PRAZO DE VALIDADE DE 10 MINUTOS DEPOIS  DE CRIADO;
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  //SEMPRE DEVEMOS RETORNAR O TOKEN NÃO CRIPTOGRAFADO, POIS O USUARIO VAI USAR ELE, MAS O HASH VAI FICAR SALVO NO BANCO DE DADOS;
  return tokenReset;
};
const User = mongoose.model('User', userSchema);

module.exports = User;
