const APIFeatures = require('./APIFeatures');

class ToursFeatures extends APIFeatures {
  constructor(query, Model) {
    super(query, Model);
  }

  //Aqui ele adiciona o método .sort() ao documento do Tour para que eles sejam retornados em ordem; O que ele faz:
  //1 verifica se o usuário enviou o parametro SORT na Url com this._originalQuery.sort ; Ele consegue fazer isso, pois o express transformou a Url em objeto com propriedades como sort...
  //2 Se não tiver, o else é ativado e propriedades padrão de sort escolhidas por nós são aplicadas na entrega dos tours
  //3 se tiver, a gente irá formatar os dados que vieram da URL/Objeto express para o padrão Mongoose que é diferente do da Url;
  //Ou seja, enquanto na Url se divida com virgulas { difficulty: 'easy', sort: '-price,ratingsAverage', // <--- O campo que estamos checando! ...} No mongoose é feito COM ESPAÇOS , então temos que redefinir tirando virgula e colocando espaço;
  //4 adiciona o método .sort(opções sort filtradas no formato certo--sortBy) ao nosso Tour
  sortDocuments() {
    if (this._originalQuery.sort) {
      const sortBy = this._originalQuery.sort
        .split(',')
        .map((elemento) => elemento.trim())
        .join(' ');
      this._mongoQuery = this._mongoQuery.sort(sortBy);
    } else {
      this._mongoQuery = this._mongoQuery.sort(
        '-ratingsAverage -ratingsQuantity -createdAt',
      );
    }
    return this;
  }
}
module.exports = ToursFeatures;
