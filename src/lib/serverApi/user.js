import { createApiPromise, createPostingApiPromise, acceptParams } from '../apiUtil';

export function loginWithPassword(email, password) {
  const params = { email, password };
  return createPostingApiPromise('/api/login', params);
}

export function loginWithCookie() {
  return createApiPromise('/api/login-with-cookie');
}

export function promiseToLoginWithPassword(email, password) {
  const params = { email, password };
  return createPostingApiPromise('/api/login', params);
}

export function changePassword(params) {
  const acceptedParams = acceptParams(params, ['old_password', 'new_password']);
  return createPostingApiPromise('/api/user/change-password', acceptedParams);
}

export function resetPasswordRequest(email) {
  return createPostingApiPromise('/api/user/reset-password-request', email);
}

export function resetPassword(params) {
  const acceptedParams = acceptParams(params, ['new_password', 'email', 'password_reset_token']);
  return createPostingApiPromise('/api/user/reset-password', acceptedParams);
}

export function signupUser(params) {
  const acceptedParams = acceptParams(params, ['email', 'password', 'fullName', 'notes', 'has_consented']);
  return createPostingApiPromise('/api/user/signup', acceptedParams);
}

export function resendActionationEmail(email) {
  return createPostingApiPromise('/api/user/activation/resend', email);
}

export function resetApiKey() {
  return createPostingApiPromise('/api/user/reset-api-key');
}

export function requestData() {
  return createPostingApiPromise('/api/user/request-data');
}

export function deleteAccount(email) {
  return createPostingApiPromise('/api/user/delete', { email });
}

export function updateProfile(profile) {
  const acceptedParams = acceptParams(profile, ['full_name', 'notes', 'has_consented', 'email']);
  return createPostingApiPromise('/api/user/update', acceptedParams);
}

export function logout() {
  return createApiPromise('/api/user/logout');
}
