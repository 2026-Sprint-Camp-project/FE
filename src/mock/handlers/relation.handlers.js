// 관계 API
//
// 목록 조회 4곳(팔로워/팔로잉/좋아요한 유저/리포스트한 유저)과 북마크/알림까지 전부 cursor 페이지네이션을 쓰기 때문에,
// utils/pagination.js의 paginate()를 공통으로 재사용
// 사용법은 각 handler에서 반복되는 패턴을 참고:
//  1) 원본 배열을 최신순으로 정렬하고, 커서로 쓸 id를 붙인 rawList를 만든다
//  2) paginate(rawList, { cursor, size })로 한 페이지만 잘라낸다
//  3) 내부용 id는 응답에서 제거하고 필요한 필드만 내려준다

import { http, HttpResponse } from 'msw';
import {
  mockFollows,
  mockLikes,
  mockBookmarks,
  mockReposts,
  mockNotifications,
  mockPosts,
  nextId,
  findUserById,
  toPublicUser,
} from '../db';
import { getCurrentUser } from '../utils/auth';
import { paginate } from '../utils/pagination';

/** 쿼리스트링에서 cursor/size를 꺼내는 헬퍼 */
function getPageParams(request) {
  const params = new URL(request.url).searchParams;
  return { cursor: params.get('cursor'), size: params.get('size') };
}

/** actorId가 targetUserId 본인이면 알림을 만들지 않는다 (본인 글/행동에는 알림 없음) */
function createNotification({ userId, type, actorId, postId = null }) {
  if (userId === actorId) return;
  mockNotifications.push({
    notificationId: nextId('notification'),
    userId,
    type,
    actorId,
    postId,
    createdAt: new Date().toISOString(),
  });
}

function removeNotification({ userId, type, actorId, postId = null }) {
  const index = mockNotifications.findIndex(
    (n) =>
      n.userId === userId &&
      n.type === type &&
      n.actorId === actorId &&
      n.postId === postId,
  );
  if (index !== -1) mockNotifications.splice(index, 1);
}

export const relationHandlers = [
  //==================================================================================================
  // 팔로우
  http.post('/users/:userId/follow', ({ request, params }) => {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return HttpResponse.json(
        { message: '로그인이 필요합니다.' },
        { status: 401 },
      );
    }

    const targetUserId = Number(params.userId);
    if (targetUserId === currentUser.userId) {
      return HttpResponse.json(
        { message: '자기 자신은 팔로우할 수 없습니다.' },
        { status: 400 },
      );
    }

    const targetUser = findUserById(targetUserId);
    if (!targetUser) {
      return HttpResponse.json(
        { message: '사용자를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    const alreadyFollowing = mockFollows.some(
      (f) =>
        f.followerId === currentUser.userId && f.followingId === targetUserId,
    );
    if (alreadyFollowing) {
      return HttpResponse.json(
        { message: '이미 팔로우한 사용자입니다.' },
        { status: 409 },
      );
    }

    const follow = {
      followerId: currentUser.userId,
      followingId: targetUserId,
      createdAt: new Date().toISOString(),
    };
    mockFollows.push(follow);
    createNotification({
      userId: targetUserId,
      type: 'follow',
      actorId: currentUser.userId,
    });

    return HttpResponse.json(follow, { status: 201 });
  }),

  //==================================================================================================
  // 언팔로우
  http.delete('/users/:userId/follow', ({ request, params }) => {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return HttpResponse.json(
        { message: '로그인이 필요합니다.' },
        { status: 401 },
      );
    }

    const targetUserId = Number(params.userId);
    const index = mockFollows.findIndex(
      (f) =>
        f.followerId === currentUser.userId && f.followingId === targetUserId,
    );
    if (index === -1) {
      return HttpResponse.json(
        { message: '팔로우하고 있지 않은 사용자입니다.' },
        { status: 404 },
      );
    }

    mockFollows.splice(index, 1);
    removeNotification({
      userId: targetUserId,
      type: 'follow',
      actorId: currentUser.userId,
    });

    return new HttpResponse(null, { status: 204 });
  }),

  //==================================================================================================
  // 팔로워 목록 조회
  http.get('/users/:userId/followers', ({ request, params }) => {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return HttpResponse.json(
        { message: '로그인이 필요합니다.' },
        { status: 401 },
      );
    }

    const targetUserId = Number(params.userId);
    if (!findUserById(targetUserId)) {
      return HttpResponse.json(
        { message: '사용자를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    const rawList = mockFollows
      .filter((f) => f.followingId === targetUserId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((f) => ({
        id: f.followerId,
        ...toPublicUser(findUserById(f.followerId)),
      }));

    const { items, nextCursor, hasNext } = paginate(
      rawList,
      getPageParams(request),
    );
    return HttpResponse.json(
      { followers: items.map(({ id, ...rest }) => rest), nextCursor, hasNext },
      { status: 200 },
    );
  }),

  //==================================================================================================
  // 팔로잉 목록 조회
  http.get('/users/:userId/following', ({ request, params }) => {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return HttpResponse.json(
        { message: '로그인이 필요합니다.' },
        { status: 401 },
      );
    }

    const targetUserId = Number(params.userId);
    if (!findUserById(targetUserId)) {
      return HttpResponse.json(
        { message: '사용자를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    const rawList = mockFollows
      .filter((f) => f.followerId === targetUserId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((f) => ({
        id: f.followingId,
        ...toPublicUser(findUserById(f.followingId)),
      }));

    const { items, nextCursor, hasNext } = paginate(
      rawList,
      getPageParams(request),
    );
    return HttpResponse.json(
      { following: items.map(({ id, ...rest }) => rest), nextCursor, hasNext },
      { status: 200 },
    );
  }),

  //==================================================================================================
  // 좋아요
  http.post('/posts/:postId/likes', ({ request, params }) => {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return HttpResponse.json(
        { message: '로그인이 필요합니다.' },
        { status: 401 },
      );
    }

    const postId = Number(params.postId);
    const post = mockPosts.find((p) => p.postId === postId);
    if (!post) {
      return HttpResponse.json(
        { message: '게시글을 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    const alreadyLiked = mockLikes.some(
      (l) => l.postId === postId && l.userId === currentUser.userId,
    );
    if (alreadyLiked) {
      return HttpResponse.json(
        { message: '이미 좋아요한 게시글입니다.' },
        { status: 409 },
      );
    }

    mockLikes.push({
      postId,
      userId: currentUser.userId,
      createdAt: new Date().toISOString(),
    });
    createNotification({
      userId: post.userId,
      type: 'like',
      actorId: currentUser.userId,
      postId,
    });

    const likeCount = mockLikes.filter((l) => l.postId === postId).length;
    return HttpResponse.json(
      { postId, userId: currentUser.userId, liked: true, likeCount },
      { status: 201 },
    );
  }),

  //==================================================================================================
  // 좋아요 취소
  http.delete('/posts/:postId/likes', ({ request, params }) => {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return HttpResponse.json(
        { message: '로그인이 필요합니다.' },
        { status: 401 },
      );
    }

    const postId = Number(params.postId);
    const index = mockLikes.findIndex(
      (l) => l.postId === postId && l.userId === currentUser.userId,
    );
    if (index === -1) {
      return HttpResponse.json(
        { message: '좋아요하지 않은 게시글입니다.' },
        { status: 404 },
      );
    }

    mockLikes.splice(index, 1);
    const post = mockPosts.find((p) => p.postId === postId);
    if (post) {
      removeNotification({
        userId: post.userId,
        type: 'like',
        actorId: currentUser.userId,
        postId,
      });
    }

    return new HttpResponse(null, { status: 204 });
  }),

  //==================================================================================================
  // 좋아요한 유저 목록 조회
  http.get('/posts/:postId/likes', ({ request, params }) => {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return HttpResponse.json(
        { message: '로그인이 필요합니다.' },
        { status: 401 },
      );
    }

    const postId = Number(params.postId);
    if (!mockPosts.some((p) => p.postId === postId)) {
      return HttpResponse.json(
        { message: '게시글을 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    const likesForPost = mockLikes
      .filter((l) => l.postId === postId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const rawList = likesForPost.map((l) => ({
      id: l.userId,
      ...toPublicUser(findUserById(l.userId)),
    }));

    const { items, nextCursor, hasNext } = paginate(
      rawList,
      getPageParams(request),
    );
    return HttpResponse.json(
      {
        users: items.map(({ id, ...rest }) => rest),
        likeCount: likesForPost.length,
        nextCursor,
        hasNext,
      },
      { status: 200 },
    );
  }),

  //==================================================================================================
  // 북마크 저장
  http.post('/posts/:postId/bookmarks', ({ request, params }) => {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return HttpResponse.json(
        { message: '로그인이 필요합니다.' },
        { status: 401 },
      );
    }

    const postId = Number(params.postId);
    if (!mockPosts.some((p) => p.postId === postId)) {
      return HttpResponse.json(
        { message: '게시글을 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    const alreadyBookmarked = mockBookmarks.some(
      (b) => b.postId === postId && b.userId === currentUser.userId,
    );
    if (alreadyBookmarked) {
      return HttpResponse.json(
        { message: '이미 북마크한 게시글입니다.' },
        { status: 409 },
      );
    }

    mockBookmarks.push({
      postId,
      userId: currentUser.userId,
      createdAt: new Date().toISOString(),
    });
    // 명세상 북마크는 알림을 만들지 않는다.

    return HttpResponse.json(
      { postId, userId: currentUser.userId, bookmarked: true },
      { status: 201 },
    );
  }),

  //==================================================================================================
  // 북마크 취소 (본인 북마크만 삭제되도록 currentUser 기준으로만 찾는다)
  http.delete('/posts/:postId/bookmarks', ({ request, params }) => {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return HttpResponse.json(
        { message: '로그인이 필요합니다.' },
        { status: 401 },
      );
    }

    const postId = Number(params.postId);
    const index = mockBookmarks.findIndex(
      (b) => b.postId === postId && b.userId === currentUser.userId,
    );
    if (index === -1) {
      return HttpResponse.json(
        { message: '북마크하지 않은 게시글입니다.' },
        { status: 404 },
      );
    }

    mockBookmarks.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  //==================================================================================================
  // 내 북마크 조회
  http.get('/users/me/bookmarks', ({ request }) => {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return HttpResponse.json(
        { message: '로그인이 필요합니다.' },
        { status: 401 },
      );
    }

    const rawList = mockBookmarks
      .filter((b) => b.userId === currentUser.userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((b) => {
        const post = mockPosts.find((p) => p.postId === b.postId);
        return { id: b.postId, ...post };
      })
      .filter((item) => item.postId !== undefined); // 원글이 삭제된 북마크는 제외

    const { items, nextCursor, hasNext } = paginate(
      rawList,
      getPageParams(request),
    );
    return HttpResponse.json(
      { bookmarks: items.map(({ id, ...rest }) => rest), nextCursor, hasNext },
      { status: 200 },
    );
  }),

  //==================================================================================================
  // 리포스트
  http.post('/posts/:postId/reposts', ({ request, params }) => {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return HttpResponse.json(
        { message: '로그인이 필요합니다.' },
        { status: 401 },
      );
    }

    const postId = Number(params.postId);
    const post = mockPosts.find((p) => p.postId === postId);
    if (!post) {
      return HttpResponse.json(
        { message: '게시글을 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    const alreadyReposted = mockReposts.some(
      (r) => r.postId === postId && r.userId === currentUser.userId,
    );
    if (alreadyReposted) {
      return HttpResponse.json(
        { message: '이미 리포스트한 게시글입니다.' },
        { status: 409 },
      );
    }

    mockReposts.push({
      postId,
      userId: currentUser.userId,
      createdAt: new Date().toISOString(),
    });
    createNotification({
      userId: post.userId,
      type: 'repost',
      actorId: currentUser.userId,
      postId,
    });

    const repostCount = mockReposts.filter((r) => r.postId === postId).length;
    return HttpResponse.json(
      { postId, userId: currentUser.userId, reposted: true, repostCount },
      { status: 201 },
    );
  }),

  //==================================================================================================
  // 리포스트 취소
  http.delete('/posts/:postId/reposts', ({ request, params }) => {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return HttpResponse.json(
        { message: '로그인이 필요합니다.' },
        { status: 401 },
      );
    }

    const postId = Number(params.postId);
    const index = mockReposts.findIndex(
      (r) => r.postId === postId && r.userId === currentUser.userId,
    );
    if (index === -1) {
      return HttpResponse.json(
        { message: '리포스트하지 않은 게시글입니다.' },
        { status: 404 },
      );
    }

    mockReposts.splice(index, 1);
    const post = mockPosts.find((p) => p.postId === postId);
    if (post) {
      removeNotification({
        userId: post.userId,
        type: 'repost',
        actorId: currentUser.userId,
        postId,
      });
    }

    return new HttpResponse(null, { status: 204 });
  }),

  //==================================================================================================
  // 리포스트한 유저 목록 조회
  http.get('/posts/:postId/reposts', ({ request, params }) => {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return HttpResponse.json(
        { message: '로그인이 필요합니다.' },
        { status: 401 },
      );
    }

    const postId = Number(params.postId);
    if (!mockPosts.some((p) => p.postId === postId)) {
      return HttpResponse.json(
        { message: '게시글을 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    const rawList = mockReposts
      .filter((r) => r.postId === postId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((r) => ({ id: r.userId, ...toPublicUser(findUserById(r.userId)) }));

    const { items, nextCursor, hasNext } = paginate(
      rawList,
      getPageParams(request),
    );
    return HttpResponse.json(
      { users: items.map(({ id, ...rest }) => rest), nextCursor, hasNext },
      { status: 200 },
    );
  }),

  //==================================================================================================
  // 알림 목록 조회
  http.get('/notifications', ({ request }) => {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return HttpResponse.json(
        { message: '로그인이 필요합니다.' },
        { status: 401 },
      );
    }

    const rawList = mockNotifications
      .filter((n) => n.userId === currentUser.userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((n) => ({
        id: n.notificationId,
        notificationId: n.notificationId,
        type: n.type,
        actor: toPublicUser(findUserById(n.actorId)),
        postId: n.postId,
        createdAt: n.createdAt,
      }));

    const { items, nextCursor, hasNext } = paginate(
      rawList,
      getPageParams(request),
    );
    return HttpResponse.json(
      {
        notifications: items.map(({ id, ...rest }) => rest),
        nextCursor,
        hasNext,
      },
      { status: 200 },
    );
  }),
];
