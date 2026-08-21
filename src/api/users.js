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
  // 이미 알고 있는 실제 userId는 항상 숫자(number) 타입으로 넘어온다(JSON에서 온 값
  // 그대로 쓰는 profile.userId, member.userId 등). route param 등 문자열로 들어온 값은
  // 숫자로만 이뤄져 있어도 username으로 보고 항상 검색한다 — username이 "1234"처럼
  // 순수 숫자인 계정을 실제 id로 오인해서 엉뚱한 유저를 조회해버리는 버그가 있었다
  // (문자열 형태만으로 "숫자면 id"라고 판단했던 게 원인).
  if (typeof idOrUsername === 'number') return idOrUsername;

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
