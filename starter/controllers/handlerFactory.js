const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id).setOptions({
      skipPopulate: true,
    });

    //set options define opções de criação de variaveis para manipulação de resultados em middlewares pre save/pre query...

    if (!doc) {
      return next(new AppError(404, 'Nenhum documento com esse Id'));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).setOptions({
      skipPopulate: true,
    });

    if (!doc) {
      return next(new AppError(404, 'Nenhum documento com esse Id'));
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.createOne = (Model, getData) =>
  catchAsync(async (req, res, next) => {
    const object = getData ? getData(req) : req.body;
    const newDoc = await Model.create(object);

    res.status(201).json({ status: 'success', data: { tour: newDoc } });
  });

exports.getAll = (Model, Feature) =>
  catchAsync(async (req, res, next) => {
    const queryFeatures = await new Feature(req.query, Model)
      //FILTRA A REQ.QUERY PARA COLOCAR NO FIND
      .deleteControlFields()
      .convertOperators()
      .buildMongoQuery()
      //APLICA NO FIND OS MÉTODOS .SORT/.FILTER JÁ COM OS CAMPOS FORMATADOS PARA O PADRÃO MONGOOSE
      .sortDocuments()
      .filterFields()
      //APLICA TAMBÉM JUNTO O MÉTODO DE PAGINAÇÃO + VERIFICAÇÃO DE ERRO SE A PAGINA ESCOLHIDA EXISTE
      .applyPagination()
      .checkPageExists();

    const doc = await queryFeatures.mongoQuery.explain();

    res
      .status(200)
      .json({ status: 'sucess', results: doc.length, data: { doc } });
  });

exports.getOne = (Model, popOption) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (popOption) query = query.populate(popOption);
    const doc = await query;

    if (!doc) {
      return next(new AppError(404, 'Nenhum documento com esse Id'));
    }
    res.status(200).json({ status: 'sucess', data: { doc } }); // Exemplo de retorno temporário
  });
