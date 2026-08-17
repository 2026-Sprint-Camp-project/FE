import { request, saveTokens, getAccessToken, clearTokens } from './client';

export { saveTokens, getAccessToken, clearTokens };

/**
 * 회원가입
 * @param {{ email: string, password: string, username: string, name: string, birthDate: string }} payload
 */
export function signup(payload) {
  return request('/users/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * 로그인
 * @param {{ username: string, password: string }} payload
 */
export function login(payload) {
  return request('/users/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
