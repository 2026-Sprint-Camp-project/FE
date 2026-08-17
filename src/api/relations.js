// 팔로우 관계 API
//
// 백엔드가 숫자 userId만 받기 때문에(users.js의 resolveUserId 참고),
// 여기서도 username이 들어오면 내부적으로 id로 변환한 뒤 요청한다.

import { request, authHeader } from './client';
import { resolveUserId } from './users';

function buildQuery({ cursor, size } = {}) {
  const params = new URLSearchParams();
  if (cursor) params.set('cursor', cursor);
  if (size) params.set('size', size);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

/** 팔로우 */
export async function follow(idOrUsername) {
  const userId = await resolveUserId(idOrUsername);
  return request(`/users/${userId}/follow`, {
    method: 'POST',
    headers: authHeader(),
  });
}

/** 언팔로우 */
export async function unfollow(idOrUsername) {
  const userId = await resolveUserId(idOrUsername);
  return request(`/users/${userId}/follow`, {
    method: 'DELETE',
    headers: authHeader(),
  });
}

/** 팔로워 목록 (커서 페이지네이션) */
export async function getFollowers(idOrUsername, page) {
  const userId = await resolveUserId(idOrUsername);
  return request(`/users/${userId}/followers${buildQuery(page)}`, {
    headers: authHeader(),
  });
}

/** 팔로잉 목록 (커서 페이지네이션) */
export async function getFollowing(idOrUsername, page) {
  const userId = await resolveUserId(idOrUsername);
  return request(`/users/${userId}/following${buildQuery(page)}`, {
    headers: authHeader(),
  });
}
