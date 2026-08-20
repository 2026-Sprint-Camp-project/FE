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

// 3. 게시글 상세 조회 (GET /posts/:postId)
export const getPost = async (postId) => {
  const response = await client.get(`/posts/${postId}`);
  return response.data;
};

// 4. 게시글 수정 (PATCH /posts/:postId)
export const updatePost = async (postId, content) => {
  const response = await client.patch(`/posts/${postId}`, { content });
  return response.data;
};

// 5. 게시글 삭제 (DELETE /posts/:postId)
export const deletePost = async (postId) => {
  const response = await client.delete(`/posts/${postId}`);
  return response.data;
};

// 6. 좋아요 (POST /posts/:postId/likes)
export const likePost = async (postId) => {
  const response = await client.post(`/posts/${postId}/likes`);
  return response.data;
};

// 7. 좋아요 취소 (DELETE /posts/:postId/likes)
export const unlikePost = async (postId) => {
  const response = await client.delete(`/posts/${postId}/likes`);
  return response.data;
};

// 8. 좋아요 사용자 조회 (GET /posts/:postId/likes)
export const getPostLikers = async (postId, params) => {
  const response = await client.get(`/posts/${postId}/likes`, { params });
  return response.data;
};