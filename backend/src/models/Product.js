const mongoose = require('mongoose');
const { CATEGORIES, OCCASIONS, CUSTOMISATIONS } = require('../constants');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    category: { type: String, required: true, enum: CATEGORIES, index: true },
    description: { type: String, required: true, trim: true },
    // Price range per unit, in rupees.
    priceMin: { type: Number, required: true, min: 0 },
    priceMax: { type: Number, required: true, min: 0 },
    occasions: [{ type: String, enum: OCCASIONS }],
    customisations: [{ type: String, enum: CUSTOMISATIONS }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.pre('validate', function (next) {
  if (this.priceMax < this.priceMin) {
    return next(new Error('priceMax must be greater than or equal to priceMin'));
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
