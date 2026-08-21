// 리스트(관심 유저 묶음) API
import { request, authHeader } from './client';
import { resolveUserId, getUser } from './users';

// 백엔드가 리스트 조회 응답은 snake_case(list_id, list_name, is_private...)로 주는데
// 생성/수정 요청 바디는 camelCase(listName, isPrivate...)를 그대로 받아준다 — 아마 ORM
// 모델을 거쳐 쓸 땐 camelCase 속성명이 그대로 매핑되고, 읽을 땐 raw 쿼리 결과라 DB
// 컬럼명(snake_case)이 그대로 나오는 듯. 그래서 읽기 쪽에서만 정규화한다.
function normalizeList(raw) {
  if (!raw) return raw;
  return {
    ...raw,
    listId: raw.listId ?? raw.list_id,
    userId: raw.userId ?? raw.user_id,
    listName: raw.listName ?? raw.list_name,
    description: raw.description ?? '',
    isPrivate: Boolean(raw.isPrivate ?? raw.is_private),
    createdAt: raw.createdAt ?? raw.created_at,
  };
}

// 멤버 목록 API는 { member_id, list_id, added_at }만 주고 이름/아이디/프로필
// 이미지 같은 유저 정보는 안 내려준다 (member_id가 곧 유저 id). 그래서
// getListMembers에서 유저별로 getUser를 따로 호출해 프로필을 합쳐준다.
function normalizeListMember(raw) {
  if (!raw) return raw;
  return {
    userId: raw.member_id ?? raw.memberId ?? raw.user_id ?? raw.userId,
    listId: raw.list_id ?? raw.listId,
    addedAt: raw.added_at ?? raw.addedAt,
  };
}

/**
 * 리스트 생성
 * @param {{ listName: string, description?: string, isPrivate: boolean }} payload
 */
export async function createList(payload) {
  const data = await request('/users/me/lists', {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify(payload),
  });
  return { ...data, list: normalizeList(data.list) };
}

/** 내 리스트 목록 조회 */
export async function getMyLists() {
  const data = await request('/users/me/lists', { headers: authHeader() });
  return { ...data, lists: (data.lists ?? []).map(normalizeList) };
}

/**
 * 리스트 수정
 * @param {number} listId
 * @param {{ listName?: string, description?: string, isPrivate?: boolean }} payload
 */
export async function updateList(listId, payload) {
  const data = await request(`/users/me/lists/${listId}`, {
    method: 'PATCH',
    headers: authHeader(),
    body: JSON.stringify(payload),
  });
  return { ...data, list: normalizeList(data.list) };
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

/** 리스트 멤버 목록 조회 (멤버별 프로필을 getUser로 보충해서 합친다) */
export async function getListMembers(listId) {
  const data = await request(`/lists/${listId}/members`, { headers: authHeader() });
  const members = (data.members ?? []).map(normalizeListMember);

  const withProfiles = await Promise.all(
    members.map(async (member) => {
      try {
        const profileData = await getUser(member.userId);
        return { ...member, ...profileData.user };
      } catch {
        // 탈퇴 등으로 프로필 조회가 실패해도 최소한 id는 남겨서 삭제는 가능하게 한다
        return member;
      }
    }),
  );

  return { ...data, members: withProfiles };
}

/** 다른 사용자의 리스트 목록 조회 (username/id 둘 다 받는다) */
export async function getUserLists(idOrUsername) {
  const userId = await resolveUserId(idOrUsername);
  const data = await request(`/users/${userId}/lists`, { headers: authHeader() });
  return { ...data, lists: (data.lists ?? []).map(normalizeList) };
}
