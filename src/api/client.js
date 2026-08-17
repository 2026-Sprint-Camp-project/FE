import axios from 'axios';

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

// posts.js처럼 axios 인스턴스가 필요한 곳을 위한 클라이언트.
// 인증 헤더 주입과 401 처리는 위 request()와 동일한 규칙을 인터셉터로 맞춘다.
const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

client.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const hadAuthHeader = Boolean(error.config?.headers?.Authorization);
    if (error.response?.status === 401 && hadAuthHeader) {
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  },
);

export default client;
