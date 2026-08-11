// 가짜 DB
// - mockUsers: 회원
// - mockPosts: 게시글
// - mockFollows / mockLikes / mockBookmarks / mockReposts: 관계(누가 무엇을 했는지)
// - mockNotifications: 알림
//
// Figma 디자인 목업에 나온 이름(김민준, 이서연, 박도윤, 최하은)을 그대로 사용함. -> 수정해야 할 것 같음... 일단 피그마 대로 생성함.

//==================================================================================================
// 회원 (userId: 1)이 로그인/회원가입 화면에서 계속 사용할 "나"에 해당하는 계정이다.
export const mockUsers = [
  {
    userId: 1,
    email: 'minjun@example.com',
    username: 'minjun_dev',
    name: '김민준',
    password: 'password123', // mock 전용 평문 비밀번호
    birthDate: '2000-03-14',
    bio: '프론트엔드 개발자 지망생 🌱',
    location: '서울',
    profileImageUrl: null,
    bannerImageUrl: null,
    isPrivate: false,
    createdAt: '2026-07-01T09:00:00.000Z',
  },
  {
    userId: 2,
    email: 'seoyeon@example.com',
    username: 'seoyeon',
    name: '이서연',
    password: 'password123',
    birthDate: '1999-11-02',
    bio: '디자인 시스템 좋아함',
    location: '경기',
    profileImageUrl: null,
    bannerImageUrl: null,
    isPrivate: false,
    createdAt: '2026-07-02T09:00:00.000Z',
  },
  {
    userId: 3,
    email: 'doyoon@example.com',
    username: 'doyoon',
    name: '박도윤',
    password: 'password123',
    birthDate: '2001-05-20',
    bio: '',
    location: '',
    profileImageUrl: null,
    bannerImageUrl: null,
    isPrivate: false,
    createdAt: '2026-07-03T09:00:00.000Z',
  },
  {
    userId: 4,
    email: 'haeun@example.com',
    username: 'haeun',
    name: '최하은',
    password: 'password123',
    birthDate: '2000-09-09',
    bio: '',
    location: '',
    profileImageUrl: null,
    bannerImageUrl: null,
    isPrivate: false,
    createdAt: '2026-07-04T09:00:00.000Z',
  },
];

//==================================================================================================
export const mockPosts = [
  {
    postId: 1,
    userId: 1,
    content: 'X 클론 프로젝트 시작! 다들 화이팅 💪',
    viewCount: 42,
    createdAt: '2026-08-04T15:24:00.000Z',
    editedAt: null,
  },
  {
    postId: 2,
    userId: 2,
    content: '졸려',
    viewCount: 15,
    createdAt: '2026-08-05T10:12:00.000Z',
    editedAt: null,
  },
  {
    postId: 3,
    userId: 3,
    content: '다들 화이팅하세요 🔥',
    viewCount: 8,
    createdAt: '2026-08-06T08:30:00.000Z',
    editedAt: null,
  },
];

//==================================================================================================
// { followerId: 팔로우 하는 사람, followingId: 팔로우 당하는 사람 }
export const mockFollows = [
  { followerId: 2, followingId: 1, createdAt: '2026-08-01T00:00:00.000Z' },
  { followerId: 3, followingId: 1, createdAt: '2026-08-02T00:00:00.000Z' },
  { followerId: 1, followingId: 2, createdAt: '2026-08-03T00:00:00.000Z' },
];

export const mockLikes = [
  { postId: 2, userId: 1, createdAt: '2026-08-05T11:00:00.000Z' },
];

export const mockBookmarks = [];

export const mockReposts = [];

export const mockNotifications = [
  {
    notificationId: 1,
    userId: 1, // 알림을 받는 사람
    type: 'follow',
    actorId: 2, // 알림을 발생시킨 사람
    postId: null,
    createdAt: '2026-08-03T00:00:00.000Z',
  },
];

//==================================================================================================
// id 발급기 — 새 데이터를 만들 때마다 겹치지 않는 id를 순서대로 준다.
const counters = {
  user: mockUsers.length,
  post: mockPosts.length,
  notification: mockNotifications.length,
};

export function nextId(key) {
  counters[key] += 1;
  return counters[key];
}

//==================================================================================================
// 응답에 그대로 내보내면 안 되는 필드(password)를 제거해서 반환하는 헬퍼들.

/** 목록/검색 등 가벼운 응답에 쓰는 최소 정보 */
export function toPublicUser(user) {
  const { userId, username, name, profileImageUrl } = user;
  return { userId, username, name, profileImageUrl };
}

/** 내 프로필/다른 사람 프로필 상세 조회에 쓰는 전체 정보 */
export function toProfileUser(user) {
  const { password, ...rest } = user;
  return {
    ...rest,
    followingCount: getFollowingCount(user.userId),
    followerCount: getFollowerCount(user.userId),
  };
}

export function getFollowerCount(userId) {
  return mockFollows.filter((f) => f.followingId === userId).length;
}

export function getFollowingCount(userId) {
  return mockFollows.filter((f) => f.followerId === userId).length;
}

export function findUserById(userId) {
  return mockUsers.find((u) => u.userId === Number(userId)) ?? null;
}
