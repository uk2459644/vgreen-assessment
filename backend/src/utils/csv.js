// Minimal CSV writer (no dependency, easy to explain).
// - quotes cells containing commas, quotes or newlines
// - prefixes cells that start with = + - @ so Excel never runs them as formulas
// - adds a BOM so Excel opens ₹ and other UTF-8 characters correctly

function escapeCell(value) {
  if (value === null || value === undefined) return '';
  let s;
  if (Array.isArray(value)) s = value.join('; ');
  else if (value instanceof Date) s = value.toISOString();
  else s = String(value);

  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  if (/[",\n\r]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}

// columns: [{ header: 'Name', value: (row) => row.name }]
function toCsv(columns, rows) {
  const head = columns.map((c) => escapeCell(c.header)).join(',');
  const body = rows.map((row) => columns.map((c) => escapeCell(c.value(row))).join(','));
  return `﻿${[head, ...body].join('\r\n')}\r\n`;
}

module.exports = { toCsv, escapeCell };
