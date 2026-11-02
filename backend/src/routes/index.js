const express = require('express');
const rateLimit = require('express-rate-limit');
const { requireAdmin } = require('../middleware/auth');
const { listProducts, getProduct, getMeta } = require('../controllers/productController');
const { createEnquiry } = require('../controllers/enquiryController');
const admin = require('../controllers/adminController');

const router = express.Router();

const limiter = (max, message) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: { message } },
  });

// ---- Public ----
router.get('/health', (req, res) => res.json({ ok: true }));
router.get('/meta', getMeta);
router.get('/products', listProducts);
router.get('/products/:id', getProduct);
router.post('/enquiries', limiter(30, 'Too many enquiries from this network. Try again later.'), createEnquiry);

// ---- Admin ----
router.post('/admin/login', limiter(10, 'Too many login attempts. Try again in 15 minutes.'), admin.login);
router.get('/admin/stats', requireAdmin, admin.stats);
router.get('/admin/enquiries', requireAdmin, admin.listEnquiries);
// Must stay above any "/:id" route so "export.csv" is not read as an id.
router.get('/admin/enquiries/export.csv', requireAdmin, admin.exportCsv);
router.patch('/admin/enquiries/:id/status', requireAdmin, admin.updateStatus);

module.exports = router;
