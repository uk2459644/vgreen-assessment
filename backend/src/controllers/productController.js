const { z } = require('zod');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { CATEGORIES, OCCASIONS, CUSTOMISATIONS, BUDGET_KEYS, BUDGET_BANDS } = require('../constants');
const { budgetFilter } = require('../utils/budget');
const { ApiError, asyncHandler } = require('../utils/ApiError');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const querySchema = z.object({
  category: z.enum(CATEGORIES).optional(),
  occasion: z.enum(OCCASIONS).optional(),
  customisation: z.enum(CUSTOMISATIONS).optional(),
  budget: z.enum(BUDGET_KEYS).optional(),
  search: z.string().trim().max(60).optional(),
});

// GET /api/products?category=&occasion=&budget=&search=
// All filters are optional and combine with AND.
const listProducts = asyncHandler(async (req, res) => {
  const q = querySchema.parse(
    // Treat ?category= (empty) as "no filter".
    Object.fromEntries(Object.entries(req.query).filter(([, v]) => v !== ''))
  );

  const filter = { isActive: true };
  if (q.category) filter.category = q.category;
  if (q.occasion) filter.occasions = q.occasion; // matches if the array contains it
  if (q.customisation) filter.customisations = q.customisation;
  if (q.budget) Object.assign(filter, budgetFilter(q.budget));
  if (q.search) {
    const rx = new RegExp(escapeRegex(q.search), 'i');
    filter.$or = [{ name: rx }, { description: rx }];
  }

  const products = await Product.find(filter).sort({ category: 1, priceMin: 1 }).lean();
  res.json({ count: products.length, products });
});

// GET /api/products/:id
const getProduct = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(404, 'Product not found');
  const product = await Product.findOne({ _id: req.params.id, isActive: true }).lean();
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ product });
});

// GET /api/meta  -> the lists used to build filter UIs and form dropdowns.
const getMeta = (req, res) => {
  res.json({
    categories: CATEGORIES,
    occasions: OCCASIONS,
    customisations: CUSTOMISATIONS,
    budgetBands: BUDGET_BANDS.map(({ key, label }) => ({ key, label })),
  });
};

module.exports = { listProducts, getProduct, getMeta };
