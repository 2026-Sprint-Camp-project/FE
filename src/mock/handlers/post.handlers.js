// 게시글 API
//
// 게시글 목록 조회(GET /posts)의 인증 여부는 명세에 "논의 필요"로 표시.
// 이 mock에서는 우선 "인증 불필요(공개 피드)"로 구현함

import { http, HttpResponse } from 'msw';
import { mockPosts, nextId, findUserById } from '../db';
import { getCurrentUser } from '../utils/auth';

/** 게시글 목록/상세 응답에 username을 덧붙여서 반환하기 위한 헬퍼 */
function toPostResponse(post) {
  const author = findUserById(post.userId);
  return { ...post, username: author?.username ?? '(알 수 없음)' };
}

export const postHandlers = [
  //==================================================================================================
  // 게시글 작성
  http.post('/posts', async ({ request }) => {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return HttpResponse.json(
        { message: '로그인이 필요합니다.' },
        { status: 401 },
      );
    }

    const { content } = await request.json();
    if (!content || !content.trim()) {
      return HttpResponse.json(
        { message: '게시글 내용을 입력해주세요.' },
        { status: 400 },
      );
    }

    const newPost = {
      postId: nextId('post'),
      userId: currentUser.userId,
      content,
      viewCount: 0,
      createdAt: new Date().toISOString(),
      editedAt: null,
    };
    mockPosts.unshift(newPost); // 최신 글이 앞에 오도록

    return HttpResponse.json(newPost, { status: 201 });
  }),

  //==================================================================================================
  // 게시글 목록 조회 (최신순)
  http.get('/posts', () => {
    const sorted = [...mockPosts].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
    return HttpResponse.json(sorted.map(toPostResponse), { status: 200 });
  }),

  //==================================================================================================
  // 게시글 상세 조회
  http.get('/posts/:postId', ({ params }) => {
    const post = mockPosts.find((p) => p.postId === Number(params.postId));
    if (!post) {
      return HttpResponse.json(
        { message: '게시글을 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    post.viewCount += 1; // 상세 조회할 때마다 조회수 증가
    return HttpResponse.json(toPostResponse(post), { status: 200 });
  }),

  //==================================================================================================
  // 게시글 수정 (작성자만 가능)
  http.patch('/posts/:postId', async ({ request, params }) => {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return HttpResponse.json(
        { message: '로그인이 필요합니다.' },
        { status: 401 },
      );
    }

    const post = mockPosts.find((p) => p.postId === Number(params.postId));
    if (!post) {
      return HttpResponse.json(
        { message: '게시글을 찾을 수 없습니다.' },
        { status: 404 },
      );
    }
    if (post.userId !== currentUser.userId) {
      return HttpResponse.json(
        { message: '본인이 작성한 게시글만 수정할 수 있습니다.' },
        { status: 403 },
      );
    }

    const { content } = await request.json();
    if (!content || !content.trim()) {
      return HttpResponse.json(
        { message: '게시글 내용을 입력해주세요.' },
        { status: 400 },
      );
    }

    post.content = content;
    post.editedAt = new Date().toISOString();

    return HttpResponse.json(post, { status: 200 });
  }),

  //==================================================================================================
  // 게시글 삭제 (작성자만 가능, mock에서는 하드 삭제)
  http.delete('/posts/:postId', ({ request, params }) => {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return HttpResponse.json(
        { message: '로그인이 필요합니다.' },
        { status: 401 },
      );
    }

    const index = mockPosts.findIndex(
      (p) => p.postId === Number(params.postId),
    );
    if (index === -1) {
      return HttpResponse.json(
        { message: '게시글을 찾을 수 없습니다.' },
        { status: 404 },
      );
    }
    if (mockPosts[index].userId !== currentUser.userId) {
      return HttpResponse.json(
        { message: '본인이 작성한 게시글만 삭제할 수 있습니다.' },
        { status: 403 },
      );
    }

    mockPosts.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
