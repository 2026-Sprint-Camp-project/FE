const BASE_URL = '';
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(
      data?.message || '요청 처리 중 오류가 발생했습니다.',
    );
    error.status = response.status;
    throw error;
  }

  return data;
}

// 토큰 로컬 저장 헬퍼
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

/** 인증이 필요한 요청에 붙이는 Authorization 헤더 */
export function authHeader() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
