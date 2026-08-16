import { request, authHeader } from './client';

function buildQuery({ cursor, size } = {}) {
  const params = new URLSearchParams();
  if (cursor) params.set('cursor', cursor);
  if (size) params.set('size', size);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

/** 팔로우 */
export function follow(idOrUsername) {
  return request(`/users/${idOrUsername}/follow`, {
    method: 'POST',
    headers: authHeader(),
  });
}

/** 언팔로우 */
export function unfollow(idOrUsername) {
  return request(`/users/${idOrUsername}/follow`, {
    method: 'DELETE',
    headers: authHeader(),
  });
}

/** 팔로워 목록 (커서 페이지네이션) */
export function getFollowers(idOrUsername, page) {
  return request(`/users/${idOrUsername}/followers${buildQuery(page)}`, {
    headers: authHeader(),
  });
}

/** 팔로잉 목록 (커서 페이지네이션) */
export function getFollowing(idOrUsername, page) {
  return request(`/users/${idOrUsername}/following${buildQuery(page)}`, {
    headers: authHeader(),
  });
}
