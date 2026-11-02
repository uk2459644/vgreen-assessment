const test = require('node:test');
const assert = require('node:assert/strict');
const { toCsv, escapeCell } = require('../src/utils/csv');
const { budgetFilter } = require('../src/utils/budget');
const { BUDGET_BANDS } = require('../src/constants');

test('csv escapes commas, quotes and newlines', () => {
  assert.equal(escapeCell('a,b'), '"a,b"');
  assert.equal(escapeCell('say "hi"'), '"say ""hi"""');
  assert.equal(escapeCell('line1\nline2'), '"line1\nline2"');
  assert.equal(escapeCell(null), '');
  assert.equal(escapeCell(['x', 'y']), 'x; y');
});

test('csv neutralises spreadsheet formulas', () => {
  assert.equal(escapeCell('=HYPERLINK("http://evil")').startsWith(`"'=`), true);
  assert.equal(escapeCell('+91 123'), "'+91 123");
  assert.equal(escapeCell('@SUM(A1)'), "'@SUM(A1)");
});

test('toCsv builds header and rows with BOM and CRLF', () => {
  const out = toCsv(
    [
      { header: 'Name', value: (r) => r.name },
      { header: 'Units', value: (r) => r.units },
    ],
    [{ name: 'Acme, Inc', units: 5 }]
  );
  assert.equal(out, '﻿Name,Units\r\n"Acme, Inc",5\r\n');
});

// Mirrors the Mongo filter in plain JS so overlap logic can be tested without a DB.
function matches(filter, p) {
  if (filter.priceMax && p.priceMax < filter.priceMax.$gte) return false;
  if (filter.priceMin && p.priceMin > filter.priceMin.$lte) return false;
  return true;
}

test('budget bands match by price-range overlap', () => {
  const steel = { priceMin: 450, priceMax: 700 }; // spans two bands
  assert.equal(matches(budgetFilter('under-500'), steel), true);
  assert.equal(matches(budgetFilter('500-1500'), steel), true);
  assert.equal(matches(budgetFilter('1500-3000'), steel), false);
  assert.equal(matches(budgetFilter('above-3000'), steel), false);

  const kit = { priceMin: 3500, priceMax: 5500 };
  assert.equal(matches(budgetFilter('above-3000'), kit), true);
  assert.equal(matches(budgetFilter('1500-3000'), kit), false);
});

test('budgetFilter returns null for an unknown key and covers every band', () => {
  assert.equal(budgetFilter('nope'), null);
  BUDGET_BANDS.forEach((b) => assert.ok(budgetFilter(b.key)));
  assert.equal(budgetFilter('above-3000').priceMin, undefined); // no upper limit
});
