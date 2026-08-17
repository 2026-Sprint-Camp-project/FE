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

// 3. 좋아요 (POST /posts/:postId/likes)
export const likePost = async (postId) => {
  const response = await client.post(`/posts/${postId}/likes`);
  return response.data;
};