// mock/handlers.js 의 /users/signup, /users/login 핸들러와 연결되는 인증 API

const BASE_URL = '';

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || '요청 처리 중 오류가 발생했습니다.');
  }

  return data;
}

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

// 토큰 로컬 저장 헬퍼
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export function saveTokens(token) {
  if (!token) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, token.refreshToken);
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}
