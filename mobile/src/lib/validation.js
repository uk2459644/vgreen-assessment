import { toLocalISO } from './format';

// Same rules as the website form and the backend (backend/src/validators/enquiry.js),
// so people get instant feedback. The server still validates everything again.

// "+91 98765-43210", "098765 43210", "9876543210" all become "9876543210".
export function normalizePhone(raw) {
  let d = String(raw).replace(/[\s\-()]/g, '');
  if (d.startsWith('+')) d = d.slice(1);
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  else if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return d;
}

export const localToday = () => toLocalISO(new Date());

export function validate(v) {
  const e = {};
  if (v.name.trim().length < 2) e.name = 'Enter your name';
  if (v.company.trim().length < 2) e.company = 'Enter your company name';
  if (!/^[6-9]\d{9}$/.test(normalizePhone(v.phone))) e.phone = 'Enter a valid 10-digit Indian mobile number';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = 'Enter a valid email address';
  if (!v.occasion) e.occasion = 'Choose an occasion';
  const units = Number(v.units);
  if (v.units === '' || !Number.isInteger(units) || units < 1) e.units = 'Enter a whole number of 1 or more';
  if (v.deliveryDate) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v.deliveryDate)) e.deliveryDate = 'Use the format YYYY-MM-DD';
    else if (v.deliveryDate < localToday()) e.deliveryDate = 'Delivery date cannot be in the past';
  }
  if (v.message.length > 1000) e.message = 'Message must be 1000 characters or fewer';
  return e;
}
