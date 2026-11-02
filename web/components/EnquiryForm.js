'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';

const EMPTY = {
  name: '',
  company: '',
  phone: '',
  email: '',
  occasion: '',
  units: '',
  budgetPerUnit: '',
  deliveryDate: '',
  message: '',
};

// Same rules as the backend (backend/src/validators/enquiry.js) so people get
// instant feedback. The server still validates everything again.
function normalizePhone(raw) {
  let d = String(raw).replace(/[\s\-()]/g, '');
  if (d.startsWith('+')) d = d.slice(1);
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  else if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return d;
}

function localToday() {
  return new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function validate(v) {
  const e = {};
  if (v.name.trim().length < 2) e.name = 'Enter your name';
  if (v.company.trim().length < 2) e.company = 'Enter your company name';
  if (!/^[6-9]\d{9}$/.test(normalizePhone(v.phone))) e.phone = 'Enter a valid 10-digit Indian mobile number';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = 'Enter a valid email address';
  if (!v.occasion) e.occasion = 'Choose an occasion';
  const units = Number(v.units);
  if (v.units === '' || !Number.isInteger(units) || units < 1) e.units = 'Enter a whole number of 1 or more';
  if (v.deliveryDate && v.deliveryDate < localToday()) e.deliveryDate = 'Delivery date cannot be in the past';
  if (v.message.length > 1000) e.message = 'Message must be 1000 characters or fewer';
  return e;
}

function focusFirstError() {
  setTimeout(() => document.querySelector('[aria-invalid="true"]')?.focus(), 0);
}

function Field({ id, label, required, error, hint, className = '', children }) {
  return (
    <div className={`field ${className}`}>
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {children}
      {hint && !error && <small className="muted">{hint}</small>}
      {error && (
        <small id={`${id}-error`} className="error" role="alert">
          {error}
        </small>
      )}
    </div>
  );
}

export default function EnquiryForm({ meta, products, initialProductIds }) {
  const router = useRouter();
  const [values, setValues] = useState(EMPTY);
  const [selectedProducts, setSelectedProducts] = useState(initialProductIds);
  const [customisation, setCustomisation] = useState([]);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [today, setToday] = useState(''); // set after mount to avoid server/client mismatch

  useEffect(() => setToday(localToday()), []);

  const clearError = (name) =>
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });

  const inputProps = (name) => ({
    id: name,
    name,
    value: values[name],
    onChange: (e) => {
      setValues((v) => ({ ...v, [name]: e.target.value }));
      clearError(name);
    },
    'aria-invalid': errors[name] ? 'true' : undefined,
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  });

  const toggle = (list, setList, value, errorKey) => {
    setList(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
    clearError(errorKey);
  };

  async function onSubmit(e) {
    e.preventDefault();
    setFormError('');

    const found = validate(values);
    if (Object.keys(found).length) {
      setErrors(found);
      focusFirstError();
      return;
    }

    setSubmitting(true);
    try {
      const { enquiry } = await api('/enquiries', {
        method: 'POST',
        body: {
          name: values.name.trim(),
          company: values.company.trim(),
          phone: values.phone,
          email: values.email.trim(),
          occasion: values.occasion,
          units: Number(values.units),
          budgetPerUnit: values.budgetPerUnit,
          deliveryDate: values.deliveryDate,
          products: selectedProducts,
          customisation,
          message: values.message.trim(),
          source: 'website',
        },
      });

      // Optional analytics: only fires if GA4 / Meta Pixel is installed on the page.
      window.gtag?.('event', 'generate_lead', { occasion: values.occasion, units: Number(values.units) });
      window.fbq?.('track', 'Lead');

      // Stay in the "submitting" state while navigating so the form cannot be sent twice.
      router.push(`/thank-you?ref=${enquiry.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.details.length) {
        const mapped = {};
        err.details.forEach((d) => {
          mapped[d.field.split('.')[0]] = d.message;
        });
        setErrors(mapped);
        setFormError('Please fix the highlighted fields.');
        focusFirstError();
      } else {
        setFormError(err.message);
      }
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="form-card">
      {formError && (
        <div className="alert" role="alert">
          {formError}
        </div>
      )}

      <div className="form-grid">
        <Field id="name" label="Your name" required error={errors.name}>
          <input type="text" autoComplete="name" {...inputProps('name')} />
        </Field>

        <Field id="company" label="Company" required error={errors.company}>
          <input type="text" autoComplete="organization" {...inputProps('company')} />
        </Field>

        <Field id="phone" label="Phone" required error={errors.phone} hint="10-digit mobile, +91 is fine">
          <input type="tel" inputMode="tel" autoComplete="tel" {...inputProps('phone')} />
        </Field>

        <Field id="email" label="Work email" required error={errors.email}>
          <input type="email" autoComplete="email" {...inputProps('email')} />
        </Field>

        <Field id="occasion" label="Occasion" required error={errors.occasion}>
          <select {...inputProps('occasion')}>
            <option value="">Select an occasion</option>
            {meta.occasions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </Field>

        <Field id="units" label="Number of units" required error={errors.units}>
          <input type="number" inputMode="numeric" min="1" step="1" {...inputProps('units')} />
        </Field>

        <Field id="budgetPerUnit" label="Budget per unit" error={errors.budgetPerUnit}>
          <select {...inputProps('budgetPerUnit')}>
            <option value="">Not sure yet</option>
            {meta.budgetBands.map((b) => (
              <option key={b.key} value={b.key}>
                {b.label}
              </option>
            ))}
          </select>
        </Field>

        <Field id="deliveryDate" label="Delivery date" error={errors.deliveryDate}>
          <input type="date" min={today || undefined} {...inputProps('deliveryDate')} />
        </Field>

        <div className="field full">
          <fieldset>
            <legend>Products you are interested in</legend>
            <div className="check-list">
              {products.map((p) => (
                <label key={p._id} className="check">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(p._id)}
                    onChange={() => toggle(selectedProducts, setSelectedProducts, p._id, 'products')}
                  />
                  <span>
                    {p.name} <span className="muted">({p.category})</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          {errors.products && (
            <small className="error" role="alert">
              {errors.products}
            </small>
          )}
        </div>

        <div className="field full">
          <fieldset>
            <legend>Customisation needed</legend>
            <div className="check-list">
              {meta.customisations.map((c) => (
                <label key={c} className="check">
                  <input
                    type="checkbox"
                    checked={customisation.includes(c)}
                    onChange={() => toggle(customisation, setCustomisation, c, 'customisation')}
                  />
                  <span>{c}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <Field id="message" label="Message" className="full" error={errors.message} hint="Anything else we should know?">
          <textarea rows={4} maxLength={1000} {...inputProps('message')} />
        </Field>
      </div>

      <div className="actions">
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? 'Sending…' : 'Send enquiry'}
        </button>
      </div>
    </form>
  );
}
