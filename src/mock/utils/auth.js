import { findUserById } from '../db';

const TOKEN_PATTERN = /^mock-access-token-(\d+)$/;

/** 로그인/회원가입 성공 시 발급하는 토큰 세트 */
export function issueToken(userId) {
  return {
    accessToken: `mock-access-token-${userId}`,
    refreshToken: `mock-refresh-token-${userId}`,
  };
}

/**
 * Authorization: Bearer {token} 헤더를 읽어 현재 로그인한 유저를 반환한다.
 * 토큰이 없거나 형식이 안 맞거나 해당 유저가 없으면 null.
 */
export function getCurrentUser(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice('Bearer '.length).trim();
  const matched = token.match(TOKEN_PATTERN);
  if (!matched) return null;

  return findUserById(matched[1]);
}
