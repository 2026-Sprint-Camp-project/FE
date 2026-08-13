// 팔로워/팔로잉/좋아요한 유저/리포스트한 유저/알림/북마크 목록까지
// 6곳에서 전부 "cursor + size → { items, nextCursor, hasNext }" 패턴이 반복돼서
// 하나의 함수로 공통화.

const DEFAULT_SIZE = 10;

export function paginate(list, { cursor, size } = {}) {
  const pageSize = Number(size) > 0 ? Number(size) : DEFAULT_SIZE;

  // cursor가 없으면 처음부터, 있으면 그 id 바로 다음부터 시작한다.
  const startIndex = cursor
    ? list.findIndex((item) => String(item.id) === String(cursor)) + 1
    : 0;

  const items = list.slice(startIndex, startIndex + pageSize);
  const hasNext = startIndex + pageSize < list.length;
  const nextCursor = hasNext ? String(items[items.length - 1].id) : null;

  return { items, nextCursor, hasNext };
}
