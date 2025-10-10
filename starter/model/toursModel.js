const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('../model/usersModel');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'O tour deve ter um nome'],
      unique: true,
      trim: true,
      maxlength: [40, 'O nome do Tour deve conter no max 30 caracteres'],
      minlength: [10, 'O nome do Tour deve conter no min 10 caracteres'],
      validate: {
        validator: function (val) {
          return /^[A-Za-zÀ-ÿ\s]+$/.test(val);
        },
        message: 'O nome deve conter apenas letras',
      },
    },
    slug: String,
    price: {
      type: Number,
      required: [true, 'O tour deve ter um preço'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: `O desconto ({VALUE}) deve ser menor que o preço`,
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'rating deve ser maior que 1'],
      max: [5, 'rating deve ser menor que 5'],
    },
    ratingsQuantity: { type: Number, default: 0 },
    difficulty: {
      type: String,
      required: [true, 'O tour deve ter uma dificuldade'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message:
          'A dificuldade do tour deve ser apenas easy, medium ou difficult',
      },
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'O tour deve ter a quantidade máxima de pessoas'],
    },
    duration: {
      type: Number,
      required: [true, 'O tour deve ter uma duração'],
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'O tour deve ter um sumário'],
    },
    description: { type: String, trim: true },
    local: { type: String, trim: true },
    imageCover: {
      type: String,
      required: [true, 'O tour deve ter uma imagem principal'],
    },
    images: [String],
    createdAt: { type: Date, default: Date.now(), select: false },
    startDates: [Date],
    secretTour: { type: Boolean, default: false },

    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      adress: String,
      description: String,
    },

    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        adress: String,
        description: String,
      },
    ],

    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', async function (next) {
//   //NÃO IREMOS EMBUTIR OS USER-GUIAS AOS TOURS, MAS SIM NORMALIZAR ELES; MAS SE FOSSEMOS EMBUTIR, TERIA QUE TER ESSE MIDDLEWARE PRE SAVE PARA COLOCAR OS USUÁRIOS NA PROPRIEDADE GUIDES ATRAVES DOS ID DELES
//   //SEMPRE QUE 2 PROMISES SÃO RODADAS POR UM MAP OU ALGO QUE ITERE, ELAS NÃO VÃO SER RODADAS COMPLETAMENTE, POIS O MAP FUNCIONA POR MEIO DO PRIMEIRO RETURN , E QUANDO USAMOS ASYNC/AWAIT ELE SEMPRE CRIA UMA PROMISE RETORNANDO ELA, TIPO: RETURN NEW PROMISE( {} )
//   //AQUI ESTAMOS SUBSTITUINDO OS ID'S NO ARRAY PELAS PROMISES PENDENTES (COLOCANDO/EMBUTINDO OS GUIAS-USER NO TOURS NA PARTE GUIAS) ATRAVÉS DO MODIFICADOR DE ARRAYS MAP + PROMISE.ALL; ASSIM NO REQ.BODY MANDAMOS OS ID'S DELES
//   const guidesPromises = this.guides.map(async (id) => {
//     return await User.findById(id);
//   });

//   //RECEBE UM ARRAY DE PROMISES E COLOCA ELES EM ORDEM; ASSIM NOS TOURS SEMPRE APARECERÃO AS INFORMAÇÕES DOS GUIDES (OS USERS DELES-COM NOME,AGE...) ASSIM, NÓS JUNTAMOS GUIDES-USERS COM OS TOURS POR DESESTRUTURAÇÃO;
//   this.guides = await Promise.all(guidesPromises);

//   next();
// });

tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

  next();
});

tourSchema.pre('save', function (next) {
  this.name = this.name
    .split(' ')
    .filter(Boolean)
    .map((el) => el.trim())
    .join(' ');

  next();
});

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  next();
});

tourSchema.pre(/^find/, function (next) {
  if (this.options.skipPopulate !== true) {
    this.populate({
      path: 'guides',
      select: '-__v -passwordChangedAt',
    });
  }
  next();
});

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
