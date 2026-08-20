// 리스트(관심 유저 묶음) API
import { request, authHeader } from './client';
import { resolveUserId } from './users';

/**
 * 리스트 생성
 * @param {{ listName: string, description?: string, isPrivate: boolean }} payload
 */
export function createList(payload) {
  return request('/users/me/lists', {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify(payload),
  });
}

/** 내 리스트 목록 조회 */
export function getMyLists() {
  return request('/users/me/lists', { headers: authHeader() });
}

/**
 * 리스트 수정
 * @param {number} listId
 * @param {{ listName?: string, description?: string, isPrivate?: boolean }} payload
 */
export function updateList(listId, payload) {
  return request(`/users/me/lists/${listId}`, {
    method: 'PATCH',
    headers: authHeader(),
    body: JSON.stringify(payload),
  });
}

/** 리스트 삭제 */
export function deleteList(listId) {
  return request(`/users/me/lists/${listId}`, {
    method: 'DELETE',
    headers: authHeader(),
  });
}

/** 리스트에 멤버(유저) 추가 (username도 받아서 내부적으로 id로 변환) */
export async function addListMember(listId, idOrUsername) {
  const userId = await resolveUserId(idOrUsername);
  return request(`/lists/${listId}/members`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify({ userId }),
  });
}

/** 리스트에서 멤버 삭제 */
export function removeListMember(listId, memberId) {
  return request(`/lists/${listId}/members/${memberId}`, {
    method: 'DELETE',
    headers: authHeader(),
  });
}

/** 리스트 멤버 목록 조회 */
export function getListMembers(listId) {
  return request(`/lists/${listId}/members`, { headers: authHeader() });
}

/** 다른 사용자의 리스트 목록 조회 (username/id 둘 다 받는다) */
export async function getUserLists(idOrUsername) {
  const userId = await resolveUserId(idOrUsername);
  return request(`/users/${userId}/lists`, { headers: authHeader() });
}
