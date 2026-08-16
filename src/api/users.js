// 유저/프로필/설정 API
//
// 실제 백엔드(Railway 배포)를 직접 찔러본 결과, GET /users/:userId는 숫자 id만 받고
// username은 안 받는다(문자열을 넣으면 404 취급). 그런데 라우트는 /:username 기반이라
// 항상 username -> userId 변환이 필요해서 resolveUserId()로 그 변환을 감춘다.
// (검색 API로 username이 정확히 일치하는 유저를 찾아 id를 얻는 방식)
//
// 참고: GET /users?keyword= 응답은 user_id(snake_case)를 쓰는데,
// 나머지 엔드포인트는 전부 userId(camelCase)를 쓴다 — 백엔드 쪽 필드명이 일관돼 있지 않아서
// resolveUserId에서 둘 다 방어적으로 읽는다.

import { request, authHeader } from './client';

/** 내 프로필 조회 */
export function getMe() {
  return request('/users/me', { headers: authHeader() });
}

/**
 * 내 프로필 수정
 * @param {{ bio?: string, location?: string, profileImageUrl?: string, bannerImageUrl?: string, name?: string, birthDate?: string }} payload
 */
export function updateMe(payload) {
  return request('/users/me', {
    method: 'PATCH',
    headers: authHeader(),
    body: JSON.stringify(payload),
  });
}

export async function resolveUserId(idOrUsername) {
  if (/^\d+$/.test(String(idOrUsername))) return idOrUsername;

  const data = await request(
    `/users?keyword=${encodeURIComponent(idOrUsername)}`,
    {
      headers: authHeader(),
    },
  );
  const matched = (data.users ?? []).find((u) => u.username === idOrUsername);
  if (!matched) {
    const error = new Error('사용자를 찾을 수 없습니다.');
    error.status = 404;
    throw error;
  }
  return matched.userId ?? matched.user_id;
}

/** 다른 사용자 프로필 조회 (username/id 둘 다 받는다) */
export async function getUser(idOrUsername) {
  const userId = await resolveUserId(idOrUsername);
  return request(`/users/${userId}`, { headers: authHeader() });
}

/** 사용자 검색 */
export function searchUsers(keyword) {
  return request(`/users?keyword=${encodeURIComponent(keyword)}`, {
    headers: authHeader(),
  });
}

/** 계정 공개/비공개 설정 */
export function updatePrivacy(isPrivate) {
  return request('/users/me/privacy', {
    method: 'PATCH',
    headers: authHeader(),
    body: JSON.stringify({ isPrivate }),
  });
}

/** 비밀번호 변경 (성공 시 새 token을 내려준다) */
export function updatePassword(newPassword) {
  return request('/users/me/settings/password', {
    method: 'PATCH',
    headers: authHeader(),
    body: JSON.stringify({ newPassword }),
  });
}

/** 이메일 변경 */
export function updateEmail(newEmail) {
  return request('/users/me/settings/email', {
    method: 'PATCH',
    headers: authHeader(),
    body: JSON.stringify({ newEmail }),
  });
}

/** 아이디(username) 변경 */
export function updateUsername(newUsername) {
  return request('/users/me/settings/username', {
    method: 'PATCH',
    headers: authHeader(),
    body: JSON.stringify({ newUsername }),
  });
}
