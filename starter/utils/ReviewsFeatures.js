const APIFeatures = require('./APIFeatures');

class ReviewsFeatures extends APIFeatures {
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
      this._mongoQuery = this._mongoQuery.sort('-createdAt');
    }
    return this;
  }
}
module.exports = ReviewsFeatures;
