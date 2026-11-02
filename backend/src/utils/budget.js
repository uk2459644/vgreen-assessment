const { BUDGET_BANDS } = require('../constants');

// Turns a budget band key into a MongoDB filter on the product's price range.
// A product matches when its [priceMin, priceMax] overlaps the band.
function budgetFilter(key) {
  const band = BUDGET_BANDS.find((b) => b.key === key);
  if (!band) return null;

  const filter = { priceMax: { $gte: band.min } };
  if (band.max !== null) filter.priceMin = { $lte: band.max };
  return filter;
}

module.exports = { budgetFilter };
