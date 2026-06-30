import { apiFetch } from './client';

export function requestOtp(email) {
  return apiFetch('/api/auth/otp/request', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function verifyOtp(email, otp) {
  return apiFetch('/api/auth/otp/verify', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });
}

export function signup(username, email, password) {
  return apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
}

export function login(email, password) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function logout() {
  return apiFetch('/api/auth/logout', { method: 'POST' });
}

export function getMe() {
  return apiFetch('/api/auth/me');
}
