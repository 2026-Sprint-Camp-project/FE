// src/api/posts.js
import client from './client';

// 1. 게시글 목록 조회 (GET /posts)
export const getPosts = async () => {
  const response = await client.get('/posts');
  return response.data;
};

// 2. 게시글 작성 (POST /posts)
export const createPost = async (content) => {
  const response = await client.post('/posts', { content });
  return response.data;
};

// 4. 게시글 상세 조회 (GET /posts/:postId)
export const getPostDetail = async (postId) => {
  const response = await client.get(`/posts/${postId}`);
  return response.data;
};

// 답글 목록 조회 (GET /posts/:postId/replies)
export const getReplies = async (postId) => {
  const response = await client.get(`/posts/${postId}/replies`);
  return response.data;
};

// 답글 작성 (POST /posts/:postId/replies)
export const createReply = async (postId, content) => {
  const response = await client.post('/posts', { 
    content: content,
    // 💡 중요: 백엔드 명세서에 따라 키 이름(parentPostId)이 다를 수 있습니다!
    // 예: replyTo, originalPostId, parentId 등
    parentPostId: postId 
  });
  return response.data;
};

// 1. 좋아요 / 취소 API
export const likePost = async (postId) => {
  const response = await client.post(`/posts/${postId}/likes`);
  return response.data;
};

export const unlikePost = async (postId) => {
  const response = await client.delete(`/posts/${postId}/likes`);
  return response.data;
};

// 2. 북마크 / 취소 API
export const bookmarkPost = async (postId) => {
  const response = await client.post(`/posts/${postId}/bookmarks`);
  return response.data;
};

export const unbookmarkPost = async (postId) => {
  const response = await client.delete(`/posts/${postId}/bookmarks`);
  return response.data;
};

// 3. 리트윗 / 취소 API
// 리트윗(리포스트) 요청
export const rePost = async (postId) => {
  const response = await client.post(`/posts/${postId}/reposts`);
  return response.data;
};

export const unrePost = async (postId) => {
  const response = await client.delete(`/posts/${postId}/reposts`);
  return response.data;
};

export const getBookmarks = async () => {
  const response = await client.get('/users/me/bookmarks');
  return response.data;
};

// 특정 사용자의 게시글 목록 조회
export const getUserPosts = async (username) => {
  // 클라이언트(client) 변수명은 기존 코드에 맞춰져 있을 것입니다. 
  // 만약 axios를 직접 쓴다면 axios.get(...) 으로 수정해주세요.
  const response = await client.get(`/posts?username=${username}`);
  return response.data;
};

// 게시글 삭제 API (DELETE /posts/:postId)
export const deletePost = async (postId) => {
  const response = await client.delete(`/posts/${postId}`);
  return response.data;
};