const mongoose = require('mongoose');
const { OCCASIONS, CUSTOMISATIONS, BUDGET_KEYS, STATUSES, SOURCES } = require('../constants');

const enquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    phone: { type: String, required: true }, // stored as 10 digits
    email: { type: String, required: true, lowercase: true, trim: true },
    occasion: { type: String, required: true, enum: OCCASIONS },
    units: { type: Number, required: true, min: 1 },
    budgetPerUnit: { type: String, enum: BUDGET_KEYS },
    deliveryDate: { type: Date },
    // Name is copied at submit time so the admin list still reads well
    // if a product is renamed or removed later.
    products: [
      {
        _id: false,
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
      },
    ],
    customisation: [{ type: String, enum: CUSTOMISATIONS }],
    message: { type: String, trim: true, maxlength: 1000 },
    source: { type: String, enum: SOURCES, required: true, index: true },
    status: { type: String, enum: STATUSES, default: 'New', index: true },
  },
  { timestamps: true }
);

enquirySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Enquiry', enquirySchema);
