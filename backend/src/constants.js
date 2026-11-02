// Single source of truth for the catalogue vocabulary.
// The website and the app read this from GET /api/meta so they never drift apart.

const CATEGORIES = ['Drinkware', 'Apparel', 'Work Essentials', 'Wellness'];

const OCCASIONS = [
  'Employee Onboarding',
  'Corporate Diwali Gifting',
  'New Year Gifts',
  'Client and Vendor Gifting',
  'Events and Trade Shows',
  'Employee Recognition',
];

const CUSTOMISATIONS = ['Logo printing', 'Laser engraving', 'Name personalisation'];

// A product matches a band when its price range overlaps the band.
// max: null means "no upper limit".
const BUDGET_BANDS = [
  { key: 'under-500', label: 'Under ₹500', min: 0, max: 499 },
  { key: '500-1500', label: '₹500 to ₹1,500', min: 500, max: 1500 },
  { key: '1500-3000', label: '₹1,500 to ₹3,000', min: 1500, max: 3000 },
  { key: 'above-3000', label: 'Above ₹3,000', min: 3001, max: null },
];

const STATUSES = ['New', 'Contacted', 'Converted', 'Lost'];
const SOURCES = ['website', 'app'];

module.exports = {
  CATEGORIES,
  OCCASIONS,
  CUSTOMISATIONS,
  BUDGET_BANDS,
  BUDGET_KEYS: BUDGET_BANDS.map((b) => b.key),
  STATUSES,
  SOURCES,
};
