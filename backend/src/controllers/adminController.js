const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { z } = require('zod');
const Admin = require('../models/Admin');
const Enquiry = require('../models/Enquiry');
const { env } = require('../config/env');
const { STATUSES, SOURCES, BUDGET_BANDS } = require('../constants');
const { statusUpdateSchema } = require('../validators/enquiry');
const { toCsv } = require('../utils/csv');
const { ApiError, asyncHandler } = require('../utils/ApiError');

const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

// Creates the admin account from .env the first time the server starts.
async function ensureAdmin() {
  const existing = await Admin.findOne({ username: env.adminUsername });
  if (existing) return;
  const passwordHash = await bcrypt.hash(env.adminPassword, 10);
  await Admin.create({ username: env.adminUsername, passwordHash });
  console.log(`Admin user "${env.adminUsername}" created`);
}

// POST /api/admin/login  -> { token }
const login = asyncHandler(async (req, res) => {
  const { username, password } = loginSchema.parse(req.body);
  const admin = await Admin.findOne({ username });
  // Same message for "no such user" and "wrong password".
  const ok = admin && (await bcrypt.compare(password, admin.passwordHash));
  if (!ok) throw new ApiError(401, 'Invalid username or password');

  const token = jwt.sign({ sub: admin.username, role: 'admin' }, env.jwtSecret, { expiresIn: '12h' });
  res.json({ token, username: admin.username, expiresIn: '12h' });
});

const listQuerySchema = z.object({
  status: z.enum(STATUSES).optional(),
  source: z.enum(SOURCES).optional(),
  q: z.string().trim().max(60).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function buildFilter({ status, source, q }) {
  const filter = {};
  if (status) filter.status = status;
  if (source) filter.source = source;
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ name: rx }, { company: rx }, { email: rx }, { phone: rx }];
  }
  return filter;
}

const clean = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== ''));

// GET /api/admin/enquiries?status=&source=&q=&page=&limit=
const listEnquiries = asyncHandler(async (req, res) => {
  const query = listQuerySchema.parse(clean(req.query));
  const filter = buildFilter(query);

  const [total, enquiries] = await Promise.all([
    Enquiry.countDocuments(filter),
    Enquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean(),
  ]);

  res.json({
    total,
    page: query.page,
    pages: Math.max(1, Math.ceil(total / query.limit)),
    enquiries,
  });
});

// PATCH /api/admin/enquiries/:id/status  { status }
const updateStatus = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(404, 'Enquiry not found');
  const { status } = statusUpdateSchema.parse(req.body);
  const enquiry = await Enquiry.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  ).lean();
  if (!enquiry) throw new ApiError(404, 'Enquiry not found');
  res.json({ enquiry });
});

// GET /api/admin/stats -> counts for the dashboard header
const stats = asyncHandler(async (req, res) => {
  const rows = await Enquiry.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  rows.forEach((r) => {
    byStatus[r._id] = r.count;
  });
  res.json({ total: Object.values(byStatus).reduce((a, b) => a + b, 0), byStatus });
});

const bandLabel = (key) => BUDGET_BANDS.find((b) => b.key === key)?.label || '';
const dateOnly = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

const csvColumns = [
  { header: 'Submitted at', value: (e) => e.createdAt },
  { header: 'Source', value: (e) => e.source },
  { header: 'Status', value: (e) => e.status },
  { header: 'Name', value: (e) => e.name },
  { header: 'Company', value: (e) => e.company },
  { header: 'Phone', value: (e) => e.phone },
  { header: 'Email', value: (e) => e.email },
  { header: 'Occasion', value: (e) => e.occasion },
  { header: 'Units', value: (e) => e.units },
  { header: 'Budget per unit', value: (e) => bandLabel(e.budgetPerUnit) },
  { header: 'Delivery date', value: (e) => dateOnly(e.deliveryDate) },
  { header: 'Products', value: (e) => (e.products || []).map((p) => p.name) },
  { header: 'Customisation', value: (e) => e.customisation },
  { header: 'Message', value: (e) => e.message },
];

// GET /api/admin/enquiries/export.csv?status=&source=&q=
// Same filters as the list, so "download what I'm looking at" works.
const exportCsv = asyncHandler(async (req, res) => {
  const query = listQuerySchema.omit({ page: true, limit: true }).parse(clean(req.query));
  const enquiries = await Enquiry.find(buildFilter(query)).sort({ createdAt: -1 }).lean();

  const stamp = new Date().toISOString().slice(0, 10);
  res.set({
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="tribegreen-enquiries-${stamp}.csv"`,
  });
  res.send(toCsv(csvColumns, enquiries));
});

module.exports = { ensureAdmin, login, listEnquiries, updateStatus, stats, exportCsv };
