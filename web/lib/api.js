import { API_URL } from './config';

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details || [];
  }
}

// One small fetch wrapper used by server components, client components and the admin page.
// Errors always become ApiError with { message, status, details: [{ field, message }] }.
export async function api(path, { method = 'GET', params, body, token } = {}) {
  const qs = params
    ? new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
      ).toString()
    : '';

  let res;
  try {
    res = await fetch(`${API_URL}${path}${qs ? `?${qs}` : ''}`, {
      method,
      cache: 'no-store',
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Could not reach the server. Please check your connection and try again.', 0, []);
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // non-JSON response; handled below
  }

  if (!res.ok) {
    throw new ApiError(
      data?.error?.message || `Request failed (${res.status})`,
      res.status,
      data?.error?.details || []
    );
  }
  return data;
}
