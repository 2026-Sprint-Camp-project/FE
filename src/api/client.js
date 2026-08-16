// 실제 백엔드 배포 주소(Railway). 로컬에 .env로 VITE_API_BASE_URL을 따로 설정하면 그 값이 우선한다.
const DEFAULT_API_BASE_URL = 'https://be-production-7252.up.railway.app';
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;
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

    // 토큰을 실어 보낸 요청이 401이면(만료/무효화) 세션이 끊긴 것 — 이 파일은
    // React를 모르니 직접 로그아웃시키는 대신 전역 이벤트만 쏘고, useAuth.jsx의
    // AuthProvider가 이걸 구독해서 로그아웃 + /login 이동을 처리하게 한다.
    const hadAuthHeader = Boolean(options.headers && options.headers.Authorization);
    if (response.status === 401 && hadAuthHeader) {
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    throw error;
  }

  return data;
}

// 토큰 로컬 저장 헬퍼
// 실제 백엔드는 현재 refreshToken을 내려주지 않는다(accessToken만 옴) — 있을 때만 저장한다.
export function saveTokens(token) {
  if (!token) return;
  if (token.accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, token.accessToken);
  if (token.refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, token.refreshToken);
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
