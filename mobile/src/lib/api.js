import { API_URL } from '../config';

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details || [];
  }
}

// Render's free tier can take about 30 seconds to wake up, so allow a long wait.
const TIMEOUT_MS = 45000;

// React Native's URLSearchParams is incomplete, so the query string is built by hand.
function toQuery(params) {
  if (!params) return '';
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
  return parts.length ? `?${parts.join('&')}` : '';
}

// Same shape as the website's api(): errors become ApiError with
// { message, status, details: [{ field, message }] }.
export async function api(path, { method = 'GET', params, body } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    let res;
    try {
      res = await fetch(`${API_URL}${path}${toQuery(params)}`, {
        method,
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (err) {
      throw new ApiError(
        err && err.name === 'AbortError'
          ? 'The server is taking too long to respond. Please try again.'
          : 'Could not reach the server. Check your internet connection and try again.',
        0,
        []
      );
    }

    let data = null;
    try {
      data = await res.json();
    } catch {
      // non-JSON response; handled below
    }

    if (!res.ok) {
      throw new ApiError(
        (data && data.error && data.error.message) || `Request failed (${res.status})`,
        res.status,
        (data && data.error && data.error.details) || []
      );
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}
