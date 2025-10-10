//OBJETIVO:  implementar recursos como filtragem, paginação, projeção de campos e validação de forma organizada

class QueryFeatures {
  //construindo/filtrando a query
  _propriedadesDeletadas = ['sort', 'page', 'limit', 'fields'];
  Model;
  _originalQuery;
  _preMongoQuery;
  _mongoQuery;


  //Inicializa a classe. Copia os parâmetros da URL (query) para _originalQuery (mantém o original) 
  // e _preMongoQuery (para manipulação e filtragem).
  constructor(query, Model) {
    this.Model = Model;
    this._originalQuery = { ...query };
    this._preMongoQuery = { ...query };
    this._mongoQuery = null;
  }
  //exemplo de _originalQuery e _preMongoQuery (msm coisa , mas para manipular):
  // { difficulty: 'easy', price: { lt: '800' }, sort: 'price', page: '2', limit: '5', fields: 'name,price' }
  //Esse é um objeto criado a partir de nossa Url pelo próprio Express e nós pegamos ele com req.query; 
  //Ele tranforma uma Url como /api/v1/tours?difficulty=easy&price[lt]=800&sort=price&page=2&limit=5&fields=name,price para objeto como esse

  get mongoQuery() {
    return this._mongoQuery;
  }

  get _preMongoQuery() {
    return this._preMongoQuery;
  }

  get originalQuery() {
    return this._originalQuery;
  }

  get query() {
    return this._query;
  }


  //Limpa Filtros Incorretos. Remove parâmetros de controle HTTP (sort, page, limit, fields)
  // do objeto de filtros do MongoDB (_preMongoQuery) para o find pesquisar
  //deleta coisas que propriedades que o find não entende:   _propriedadesDeletadas = ['sort', 'page', 'limit', 'fields'];
  //filtrando para: { difficulty: 'easy', price: { lt: '800' } }

  deleteControlFields() {
    this._propriedadesDeletadas.forEach(
      (prop) => delete this._preMongoQuery[prop],
    );

    return this;
  }

  //Traduz a Linguagem. Converte operadores fáceis de usar na URL (ex: gte, lt) para a sintaxe que o MongoDB entende (ex: $gte, $lt).
  // Permite buscas como ?price[gte]=1000.
  convertOperators() {
    this._preMongoQuery = JSON.parse(
      JSON.stringify(this._preMongoQuery).replace(
        /\b(gte|gt|lte|lt)\b/g,
        (match) => `$${match}`,
      ),
    );

    return this;
  }

  //inicia o objeto que criamos _mongoQuery com os filtros restantes Tour.find({ difficulty: 'easy', price: { $lt: '800' } })
  //Esse será o objeto que conterá o nosso tour que obtemos através da consulta find
  buildMongoQuery() {
    this._mongoQuery = this.Model.find(this._preMongoQuery);

    return this;
  }


//É um operador que  usuário pode utilizar assim como o sort...
//Ele filtra os resultados/propriedades que um Tour pode retornar
//1 verifica se o objeto veio com essa propriedade, ou seja, se o usuário selecionou opção de filter;
//2 se sim, formata os campos da Url para o padrão Mongoose que não separa por virgulas, mas por espaço; ou seja, tira as virgulas do valor da propriedade sort e coloca espaços
//3 adiciona o método select() para filtrar apenas aqueles resultados;
//4 Se não tivermos fields, excluimos por padrão a propriedade __v usando o - do select -__V;
//obs: .select() sem o - retorna apenas aquela prop, com o - ele exclui apenas aquela prop do objeto
  filterFields() {
    if (this._originalQuery.fields) {
      const fieldsBy = this._originalQuery.fields
        .split(',')
        .map((elemento) => elemento.trim())
        .join(' ');
      this._mongoQuery = this._mongoQuery.select(fieldsBy);
    } else {
      this._mongoQuery = this._mongoQuery.select('-__v');
    }

    return this;
  }


  //são os limites do nosso applyPagination; coloca as quatidades e faz o calculo
  //Skip: quantos documentos pular; se cada pagina tem 10 e eu quero ir pra pagina 3 seria (3-1) * 10 = pular 20 documentos; 
  //Se não estiver definido quantos mostrar / pagina atual ; ele define como página 1 por padrão e limite de 20;
  //retorna tudo para poder usar em outras funções para separação de responsabilidade;
  _getPaginationParams() {
    const page = +this._originalQuery.page || 1;
    const limit = +this._originalQuery.limit || 20;
    const skipNumber = (page - 1) * limit;

    return { page, limit, skipNumber };
  }

//pega os valores do _getpagination e aplica os métodos .skip(Number).limit(limit) na paginação do nosso Tour 
//basicamente isso impõe limites;
  applyPagination() {
    const { skipNumber, limit, page } = this._getPaginationParams();

    this._mongoQuery = this._mongoQuery.skip(skipNumber).limit(limit);

    return this;
  }

  //Muito importante: Evita que o usuário acesse uma pagina que está vazia!
  //Essa validação só ocorre se o usuário pediu alguma página especifica, ex: page=3
  //Operação assincrona await this.Model.countDocuments(); conta o numero de documentos já com as filtragens;
  //se for maior ou igual a quantidade de documentos que queremos pular no skip da contagem de documentos que temos ele retorna um erro ao usuário
  async checkPageExists() {
    const { skipNumber } = this._getPaginationParams();

    if (this._originalQuery.page) {
      const numTours = await this.Model.countDocuments();

      if (skipNumber >= numTours)
        throw new AppError(404,
          'Error> O corte de documentos para a pagina solicitada ultrapassou a quantidade total existente de documentos. Essa página não existe',
        )
    }

    return this;
  }
}

module.exports = QueryFeatures;

//executando--controller
//const tours = await _query;
