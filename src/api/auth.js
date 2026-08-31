import {
  request,
  saveTokens,
  getAccessToken,
  clearTokens,
  saveLocalBirthDate,
  getLocalBirthDate,
} from './client';

export { saveTokens, getAccessToken, clearTokens, saveLocalBirthDate, getLocalBirthDate };

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

/**
 * 토큰 재발급 (백엔드 응답 스펙 미정 — accessToken만 내려올 수 있음)
 */
export function refreshToken() {
  return request('/users/refresh', { method: 'POST' });
}
