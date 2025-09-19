//catchAsync armazena o conteudo da função principal como argumento fn ; função é chamada
//o addNewTour (ou qualquer outra rota) recebe função principal modelo Express com o return do catchAsync, que por sua vez,
//tem como conteudo a função da rota aramazenada dentro de fn( ),
//que é o conteudo da nossa funçao principal chamada com os argumentos express certos da função principal

module.exports = function (fn) {
  return function (req, res, next) {
    fn(req, res, next).catch((err) => next(err));
  };
};
