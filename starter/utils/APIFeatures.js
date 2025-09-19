class QueryFeatures {
  //construindo/filtrando a query
  _propriedadesDeletadas = ['sort', 'page', 'limit', 'fields'];
  Model;
  _originalQuery;
  _preMongoQuery;
  _mongoQuery;

  constructor(query, Model) {
    this.Model = Model;
    this._originalQuery = { ...query };
    this._preMongoQuery = { ...query };
    this._mongoQuery = null;
  }

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

  deleteControlFields() {
    this._propriedadesDeletadas.forEach(
      (prop) => delete this._preMongoQuery[prop],
    );

    return this;
  }

  convertOperators() {
    this._preMongoQuery = JSON.parse(
      JSON.stringify(this._preMongoQuery).replace(
        /\b(gte|gt|lte|lt)\b/g,
        (match) => `$${match}`,
      ),
    );

    return this;
  }

  buildMongoQuery() {
    this._mongoQuery = this.Model.find(this._preMongoQuery);

    return this;
  }

  //adicionando recursos

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

  _getPaginationParams() {
    const page = +this._originalQuery.page || 1;
    const limit = +this._originalQuery.limit || 20;
    const skipNumber = (page - 1) * limit;

    return { page, limit, skipNumber };
  }

  applyPagination() {
    const { skipNumber, limit, page } = this._getPaginationParams();

    this._mongoQuery = this._mongoQuery.skip(skipNumber).limit(limit);

    return this;
  }

  async checkPageExists() {
    const { skipNumber } = this._getPaginationParams();

    if (this._originalQuery.page) {
      const numTours = await this.Model.countDocuments();

      if (skipNumber >= numTours)
        throw new Error(
          'Error: o corte de documentos para a pagina solicitada ultrapassou a quantidade total existente de documentos. Essa página não existe',
        );
    }

    return this;
  }
}

module.exports = QueryFeatures;

//executando--controller
//const tours = await _query;
