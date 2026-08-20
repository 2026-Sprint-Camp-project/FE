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

/** 계정 공개/비공개 설정 (변경 전 verifyPassword로 본인 확인 필요) */
export function updatePrivacy(isPrivate) {
  return request('/users/me/settings/privacy', {
    method: 'PATCH',
    headers: authHeader(),
    body: JSON.stringify({ isPrivate }),
  });
}

/** 비밀번호 변경 (성공 시 새 token을 내려준다. 변경 전 verifyPassword로 본인 확인 필요) */
export function updatePassword(newPassword) {
  return request('/users/me/settings/password', {
    method: 'PATCH',
    headers: authHeader(),
    body: JSON.stringify({ newPassword }),
  });
}

/** 이메일 변경 (변경 전 verifyPassword로 본인 확인 필요) */
export function updateEmail(newEmail) {
  return request('/users/me/settings/email', {
    method: 'PATCH',
    headers: authHeader(),
    body: JSON.stringify({ newEmail }),
  });
}

/** 아이디(username) 변경 (변경 전 verifyPassword로 본인 확인 필요) */
export function updateUsername(newUsername) {
  return request('/users/me/settings/username', {
    method: 'PATCH',
    headers: authHeader(),
    body: JSON.stringify({ newUsername }),
  });
}

/** 비밀번호 검증 (아이디/이메일/비밀번호 변경 전 본인 확인용) */
export function verifyPassword(password) {
  return request('/users/me/settings/verification', {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify({ password }),
  });
}
