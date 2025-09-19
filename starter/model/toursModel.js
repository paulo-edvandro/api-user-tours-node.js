const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
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
        message: 'o nome deve conter apenas letras',
      },
    },
    slug: String,
    price: {
      type: Number,
      required: [true, 'O tour deve ter um numero'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        //ISSO SÓ FUNCIONA PARA A CRIAÇÃO DE NOVO DOCUMENTO, OU USANDO O .SAVE(), NÃO PARA ATUALIZAÇÃO OUTRAS;
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
          'A dificuldade do tour deve ser apaenas easy, medium ou dificult',
      },
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'O tour deve ter a quantidade máxima de pessoas'],
    },
    duration: { type: Number, required: [true, 'O tour deve ter uma duração'] },
    summary: {
      type: String,
      trim: true,
      required: [true, 'O tour deve ter sumário'],
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
    guides: { type: [String] },
    secretTour: { type: Boolean, default: false },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

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

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
