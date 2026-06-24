export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (res.status === 204) {
    return null;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    let message = data.detail || data.message || 'Something went wrong.';
    if (Array.isArray(message)) {
      message = message.map((item) => item.msg || JSON.stringify(item)).join(', ');
    }
    throw new ApiError(typeof message === 'string' ? message : JSON.stringify(message), res.status);
  }

  return data;
}
