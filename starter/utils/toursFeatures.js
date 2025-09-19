const APIFeatures = require('./APIFeatures');

class ToursFeatures extends APIFeatures {
  constructor(query, Model) {
    super(query, Model);
  }

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
