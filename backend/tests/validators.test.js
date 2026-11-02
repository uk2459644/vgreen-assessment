const test = require('node:test');
const assert = require('node:assert/strict');
const { enquiryInputSchema, normalizePhone } = require('../src/validators/enquiry');

const valid = () => ({
  name: 'Asha Verma',
  company: 'Acme Pvt Ltd',
  phone: '9876543210',
  email: 'Asha@Acme.com',
  occasion: 'Corporate Diwali Gifting',
  units: 250,
  source: 'website',
});

const fieldsOf = (result) => result.error.issues.map((i) => i.path.join('.'));

test('accepts a valid enquiry and normalises phone and email', () => {
  const r = enquiryInputSchema.safeParse({ ...valid(), phone: '+91 98765-43210' });
  assert.equal(r.success, true);
  assert.equal(r.data.phone, '9876543210');
  assert.equal(r.data.email, 'asha@acme.com');
  assert.deepEqual(r.data.products, []);
});

test('normalizePhone handles +91, 91 and leading 0', () => {
  assert.equal(normalizePhone('+919876543210'), '9876543210');
  assert.equal(normalizePhone('919876543210'), '9876543210');
  assert.equal(normalizePhone('09876543210'), '9876543210');
  assert.equal(normalizePhone('(98765) 43210'), '9876543210');
});

test('rejects invalid phone numbers', () => {
  for (const phone of ['12345', '5876543210', '98765432101234', 'abcdefghij', '']) {
    const r = enquiryInputSchema.safeParse({ ...valid(), phone });
    assert.equal(r.success, false, `should reject "${phone}"`);
    assert.ok(fieldsOf(r).includes('phone'));
  }
});

test('rejects invalid email', () => {
  for (const email of ['nope', 'a@b', 'a@@b.com', '']) {
    const r = enquiryInputSchema.safeParse({ ...valid(), email });
    assert.equal(r.success, false, `should reject "${email}"`);
    assert.ok(fieldsOf(r).includes('email'));
  }
});

test('units must be a whole number of at least 1', () => {
  for (const units of [0, -5, 2.5, 'abc', '', null]) {
    const r = enquiryInputSchema.safeParse({ ...valid(), units });
    assert.equal(r.success, false, `should reject ${JSON.stringify(units)}`);
    assert.ok(fieldsOf(r).includes('units'));
  }
  assert.equal(enquiryInputSchema.safeParse({ ...valid(), units: '100' }).data.units, 100);
});

test('occasion and source must be known values', () => {
  assert.equal(enquiryInputSchema.safeParse({ ...valid(), occasion: 'Birthday' }).success, false);
  assert.equal(enquiryInputSchema.safeParse({ ...valid(), source: 'fax' }).success, false);
});

test('optional fields may be empty strings', () => {
  const r = enquiryInputSchema.safeParse({
    ...valid(),
    budgetPerUnit: '',
    deliveryDate: '',
    message: '',
  });
  assert.equal(r.success, true);
  assert.equal(r.data.budgetPerUnit, undefined);
  assert.equal(r.data.deliveryDate, undefined);
});

test('delivery date: future ok, past rejected, bad format rejected', () => {
  const future = new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10);
  const past = new Date(Date.now() - 10 * 86400000).toISOString().slice(0, 10);
  const ok = enquiryInputSchema.safeParse({ ...valid(), deliveryDate: future });
  assert.equal(ok.success, true);
  assert.ok(ok.data.deliveryDate instanceof Date);
  assert.equal(enquiryInputSchema.safeParse({ ...valid(), deliveryDate: past }).success, false);
  assert.equal(enquiryInputSchema.safeParse({ ...valid(), deliveryDate: '31/12/2026' }).success, false);
});

test('customisation and budget must be from the allowed lists', () => {
  assert.equal(
    enquiryInputSchema.safeParse({ ...valid(), customisation: ['Logo printing'] }).success,
    true
  );
  assert.equal(enquiryInputSchema.safeParse({ ...valid(), customisation: ['Tattoo'] }).success, false);
  assert.equal(enquiryInputSchema.safeParse({ ...valid(), budgetPerUnit: 'cheap' }).success, false);
  assert.equal(enquiryInputSchema.safeParse({ ...valid(), budgetPerUnit: '500-1500' }).success, true);
});

test('product ids must look like ObjectIds', () => {
  assert.equal(enquiryInputSchema.safeParse({ ...valid(), products: ['xyz'] }).success, false);
  assert.equal(
    enquiryInputSchema.safeParse({ ...valid(), products: ['64b7f0c2a1b2c3d4e5f60718'] }).success,
    true
  );
});
