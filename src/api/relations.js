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

/** 내 팔로잉 전체 userId 집합 (커서 끝까지 순회) */
export async function getAllFollowingIds(idOrUsername) {
  const ids = new Set();
  let cursor;
  while (true) {
    const data = await getFollowing(
      idOrUsername,
      cursor ? { cursor } : undefined,
    );
    (data.following ?? []).forEach((u) =>
      ids.add(Number(u.userId ?? u.user_id)),
    );
    if (!data.hasNext || !data.nextCursor) break;
    cursor = data.nextCursor;
  }
  return ids;
}

/** 게시글 북마크 저장 */
export function bookmarkPost(postId) {
  return request(`/posts/${postId}/bookmarks`, {
    method: 'POST',
    headers: authHeader(),
  });
}

/** 게시글 북마크 취소 */
export function unbookmarkPost(postId) {
  return request(`/posts/${postId}/bookmarks`, {
    method: 'DELETE',
    headers: authHeader(),
  });
}

/** 내 북마크 목록 조회 (커서 페이지네이션) */
export function getMyBookmarks(page) {
  return request(`/users/me/bookmarks${buildQuery(page)}`, {
    headers: authHeader(),
  });
}

/** 리포스트 */
export function repost(postId) {
  return request(`/posts/${postId}/reposts`, {
    method: 'POST',
    headers: authHeader(),
  });
}

/** 리포스트 취소 */
export function unrepost(postId) {
  return request(`/posts/${postId}/reposts`, {
    method: 'DELETE',
    headers: authHeader(),
  });
}

/** 리포스트한 사용자 목록 (커서 페이지네이션) */
export function getReposters(postId, page) {
  return request(`/posts/${postId}/reposts${buildQuery(page)}`, {
    headers: authHeader(),
  });
}

/** 알림 목록 조회 (커서 페이지네이션) */
export function getNotifications(page) {
  return request(`/notifications${buildQuery(page)}`, {
    headers: authHeader(),
  });
}
