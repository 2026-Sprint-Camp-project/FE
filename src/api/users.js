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

/** 다른 사용자 프로필 조회 */
export function getUser(idOrUsername) {
  return request(`/users/${idOrUsername}`, { headers: authHeader() });
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
