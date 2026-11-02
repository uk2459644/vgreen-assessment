const { z } = require('zod');
const { OCCASIONS, CUSTOMISATIONS, BUDGET_KEYS, STATUSES, SOURCES } = require('../constants');

// "+91 98765-43210", "098765 43210", "9876543210" all become "9876543210".
function normalizePhone(raw) {
  let d = String(raw).replace(/[\s\-()]/g, '');
  if (d.startsWith('+')) d = d.slice(1);
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  else if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return d;
}

// Empty strings from forms are treated as "not provided".
const optional = (schema) =>
  z.preprocess((v) => (v === '' || v === null ? undefined : v), schema.optional());

const phone = z
  .string({ required_error: 'Phone is required' })
  .trim()
  .transform(normalizePhone)
  .refine((p) => /^[6-9]\d{9}$/.test(p), 'Enter a valid 10-digit Indian mobile number');

const email = z
  .string({ required_error: 'Email is required' })
  .trim()
  .toLowerCase()
  .email('Enter a valid email address')
  .max(120);

const units = z.coerce
  .number({ invalid_type_error: 'Units must be a number' })
  .int('Units must be a whole number')
  .min(1, 'Units must be at least 1')
  .max(1000000, 'Units is too large');

// Accepts YYYY-MM-DD. One day of grace so timezone differences between
// the user's phone and the server never reject "today".
const deliveryDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD')
  .refine((s) => !Number.isNaN(new Date(s).getTime()), 'Enter a valid date')
  .refine((s) => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    return s >= yesterday;
  }, 'Delivery date cannot be in the past')
  .transform((s) => new Date(s));

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid product id');

const enquiryInputSchema = z.object({
  name: z.string({ required_error: 'Name is required' }).trim().min(2, 'Name is too short').max(80),
  company: z
    .string({ required_error: 'Company is required' })
    .trim()
    .min(2, 'Company is too short')
    .max(120),
  phone,
  email,
  occasion: z.enum(OCCASIONS, { errorMap: () => ({ message: 'Choose a valid occasion' }) }),
  units,
  budgetPerUnit: optional(
    z.enum(BUDGET_KEYS, { errorMap: () => ({ message: 'Choose a valid budget band' }) })
  ),
  deliveryDate: optional(deliveryDate),
  products: z.array(objectId).max(20).optional().default([]),
  customisation: z
    .array(z.enum(CUSTOMISATIONS, { errorMap: () => ({ message: 'Invalid customisation' }) }))
    .max(CUSTOMISATIONS.length)
    .optional()
    .default([]),
  message: optional(z.string().trim().max(1000, 'Message is too long')),
  source: z.enum(SOURCES, { errorMap: () => ({ message: 'source must be "website" or "app"' }) }),
});

const statusUpdateSchema = z.object({
  status: z.enum(STATUSES, { errorMap: () => ({ message: `status must be one of ${STATUSES.join(', ')}` }) }),
});

module.exports = { enquiryInputSchema, statusUpdateSchema, normalizePhone };
