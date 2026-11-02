'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { API_URL } from '@/lib/config';
import { formatDate, formatDateTime } from '@/lib/format';

const TOKEN_KEY = 'tg_admin_token';
const STATUSES = ['New', 'Contacted', 'Converted', 'Lost'];

export default function AdminPage() {
  const [token, setToken] = useState(undefined); // undefined = still checking storage

  useEffect(() => {
    try {
      setToken(localStorage.getItem(TOKEN_KEY));
    } catch {
      setToken(null);
    }
  }, []);

  const login = useCallback((t) => {
    try {
      localStorage.setItem(TOKEN_KEY, t);
    } catch {
      // private mode: token stays in memory for this tab only
    }
    setToken(t);
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
    setToken(null);
  }, []);

  if (token === undefined) {
    return (
      <div className="container section">
        <p className="muted">Loading…</p>
      </div>
    );
  }
  if (!token) return <Login onLogin={login} />;
  return <Dashboard token={token} onLogout={logout} />;
}

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { token } = await api('/admin/login', { method: 'POST', body: { username, password } });
      onLogin(token);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="container section">
      <form onSubmit={submit} className="login-card" noValidate>
        <h1>Admin login</h1>
        {error && (
          <div className="alert" role="alert">
            {error}
          </div>
        )}
        <div className="field" style={{ marginBottom: 12 }}>
          <label htmlFor="username">Username</label>
          <input id="username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="field" style={{ marginBottom: 16 }}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn" disabled={busy || !username || !password}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

function Dashboard({ token, onLogout }) {
  const [filters, setFilters] = useState({ status: '', source: '', q: '' });
  const [qInput, setQInput] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ enquiries: [], total: 0, pages: 1 });
  const [stats, setStats] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);
  const [downloading, setDownloading] = useState(false);

  // An expired or invalid token (401) sends the admin back to the login form.
  const handleAuthError = useCallback(
    (err) => {
      if (err instanceof ApiError && err.status === 401) {
        onLogout();
        return true;
      }
      return false;
    },
    [onLogout]
  );

  // Budget labels for the detail view.
  useEffect(() => {
    api('/meta')
      .then(setMeta)
      .catch(() => {});
  }, []);

  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((f) => (f.q === qInput.trim() ? f : { ...f, q: qInput.trim() }));
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [qInput]);

  // Load the list and the counts whenever filters or page change.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    Promise.all([
      api('/admin/enquiries', { token, params: { ...filters, page, limit: 20 } }),
      api('/admin/stats', { token }),
    ])
      .then(([list, st]) => {
        if (cancelled) return;
        setData(list);
        setStats(st);
      })
      .catch((err) => {
        if (!cancelled && !handleAuthError(err)) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, filters, page, handleAuthError]);

  const setFilter = (key) => (e) => {
    setFilters((f) => ({ ...f, [key]: e.target.value }));
    setPage(1);
  };

  async function changeStatus(id, status) {
    setError('');
    const previous = data.enquiries;
    // Update the row immediately; put it back if the server refuses.
    setData((d) => ({ ...d, enquiries: d.enquiries.map((e) => (e._id === id ? { ...e, status } : e)) }));
    try {
      await api(`/admin/enquiries/${id}/status`, { method: 'PATCH', token, body: { status } });
      setStats(await api('/admin/stats', { token }));
    } catch (err) {
      setData((d) => ({ ...d, enquiries: previous }));
      if (!handleAuthError(err)) setError(err.message);
    }
  }

  async function downloadCsv() {
    setDownloading(true);
    setError('');
    try {
      const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v)).toString();
      const res = await fetch(`${API_URL}/admin/enquiries/export.csv${qs ? `?${qs}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        onLogout();
        return;
      }
      if (!res.ok) throw new Error('Could not download the CSV');

      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement('a');
      a.href = url;
      a.download = `tribegreen-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloading(false);
    }
  }

  const budgetLabel = (key) => meta?.budgetBands?.find((b) => b.key === key)?.label || '—';

  return (
    <div className="container section">
      <div className="result-bar">
        <h1 style={{ margin: 0 }}>Enquiries</h1>
        <button type="button" className="btn btn-outline btn-small" onClick={onLogout}>
          Log out
        </button>
      </div>

      {stats && (
        <div className="stats">
          <div className="stat">
            <strong>{stats.total}</strong>
            <span className="muted">Total</span>
          </div>
          {STATUSES.map((s) => (
            <div className="stat" key={s}>
              <strong>{stats.byStatus[s] ?? 0}</strong>
              <span className="muted">{s}</span>
            </div>
          ))}
        </div>
      )}

      <div className="toolbar">
        <div>
          <label htmlFor="a-search">Search</label>
          <input
            id="a-search"
            type="search"
            placeholder="Name, company, email, phone"
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="a-status">Status</label>
          <select id="a-status" value={filters.status} onChange={setFilter('status')}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="a-source">Source</label>
          <select id="a-source" value={filters.source} onChange={setFilter('source')}>
            <option value="">Website and app</option>
            <option value="website">Website</option>
            <option value="app">App</option>
          </select>
        </div>
        <div style={{ flex: '0 0 auto' }}>
          <button type="button" className="btn" onClick={downloadCsv} disabled={downloading}>
            {downloading ? 'Preparing…' : 'Download CSV'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert" role="alert">
          {error}
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Received</th>
              <th>Contact</th>
              <th>Occasion</th>
              <th>Units</th>
              <th>Source</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {!data.enquiries.length && (
              <tr>
                <td colSpan={7} className="muted">
                  {loading ? 'Loading…' : 'No enquiries match these filters.'}
                </td>
              </tr>
            )}
            {data.enquiries.map((e) => (
              <EnquiryRows
                key={e._id}
                e={e}
                open={openId === e._id}
                onToggle={() => setOpenId(openId === e._id ? null : e._id)}
                onStatus={(s) => changeStatus(e._id, s)}
                budgetLabel={budgetLabel}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button type="button" className="btn btn-outline btn-small" disabled={page <= 1} onClick={() => setPage(page - 1)}>
          Previous
        </button>
        <span className="muted">
          Page {data.page || page} of {data.pages} ({data.total} total)
        </span>
        <button
          type="button"
          className="btn btn-outline btn-small"
          disabled={page >= data.pages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function EnquiryRows({ e, open, onToggle, onStatus, budgetLabel }) {
  return (
    <>
      <tr>
        <td>{formatDateTime(e.createdAt)}</td>
        <td>
          <strong>{e.name}</strong>
          <br />
          {e.company}
          <br />
          <a href={`tel:${e.phone}`}>{e.phone}</a>
          <br />
          <a href={`mailto:${e.email}`}>{e.email}</a>
        </td>
        <td>{e.occasion}</td>
        <td>{e.units}</td>
        <td>
          <span className={`pill pill-${e.source}`}>{e.source}</span>
        </td>
        <td>
          <select aria-label={`Status for ${e.name}`} value={e.status} onChange={(ev) => onStatus(ev.target.value)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </td>
        <td>
          <button type="button" className="btn btn-outline btn-small" onClick={onToggle} aria-expanded={open}>
            {open ? 'Hide' : 'Details'}
          </button>
        </td>
      </tr>
      {open && (
        <tr className="detail-row">
          <td colSpan={7}>
            <dl>
              <dt>Products</dt>
              <dd>{e.products?.length ? e.products.map((p) => p.name).join(', ') : '—'}</dd>
              <dt>Customisation</dt>
              <dd>{e.customisation?.length ? e.customisation.join(', ') : '—'}</dd>
              <dt>Budget per unit</dt>
              <dd>{budgetLabel(e.budgetPerUnit)}</dd>
              <dt>Delivery date</dt>
              <dd>{e.deliveryDate ? formatDate(e.deliveryDate) : '—'}</dd>
              <dt>Message</dt>
              <dd style={{ whiteSpace: 'pre-wrap' }}>{e.message || '—'}</dd>
            </dl>
          </td>
        </tr>
      )}
    </>
  );
}
