const Enquiry = require('../models/Enquiry');
const Product = require('../models/Product');
const { enquiryInputSchema } = require('../validators/enquiry');
const { ApiError, asyncHandler } = require('../utils/ApiError');

// POST /api/enquiries  (public: used by the website and the app)
const createEnquiry = asyncHandler(async (req, res) => {
  const data = enquiryInputSchema.parse(req.body);

  // Resolve selected products and copy their names onto the enquiry.
  const ids = [...new Set(data.products)];
  let products = [];
  if (ids.length) {
    const found = await Product.find({ _id: { $in: ids } }, 'name').lean();
    if (found.length !== ids.length) {
      throw new ApiError(400, 'Validation failed', [
        { field: 'products', message: 'One or more selected products no longer exist' },
      ]);
    }
    products = found.map((p) => ({ product: p._id, name: p.name }));
  }

  const enquiry = await Enquiry.create({ ...data, products });

  // Only what the client needs for its thank-you screen / "My enquiries" list.
  res.status(201).json({
    enquiry: {
      id: enquiry._id,
      name: enquiry.name,
      company: enquiry.company,
      occasion: enquiry.occasion,
      units: enquiry.units,
      products: enquiry.products,
      status: enquiry.status,
      createdAt: enquiry.createdAt,
    },
  });
});

module.exports = { createEnquiry };
