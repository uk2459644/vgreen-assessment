const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n) => String(n).padStart(2, '0');

// 1234567 -> "12,34,567" (Indian digit grouping, written by hand so it does not depend on Intl support).
function groupIndian(n) {
  const s = String(Math.round(Number(n)));
  if (s.length <= 3) return s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `${rest},${last3}`;
}

export const formatINR = (n) => `₹${groupIndian(n)}`;

export const priceRange = (p) =>
  p.priceMin === p.priceMax ? formatINR(p.priceMin) : `${formatINR(p.priceMin)} – ${formatINR(p.priceMax)}`;

// Local calendar date as YYYY-MM-DD (not UTC, so "today" is right late in the evening in India).
export const toLocalISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function parseLocalDate(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function formatDate(value) {
  const d = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? parseLocalDate(value) : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateTime(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const h = d.getHours();
  return `${formatDate(d)}, ${h % 12 || 12}:${pad(d.getMinutes())} ${h >= 12 ? 'pm' : 'am'}`;
}
