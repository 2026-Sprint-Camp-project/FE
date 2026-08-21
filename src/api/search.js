// src/api/search.js
import client from './client';

// 1. 트윗(게시글) 검색 API
export const searchPosts = async (keyword) => {
  // 백엔드 명세에 따라 ?keyword= 또는 ?content= 등으로 수정될 수 있습니다.
  const response = await client.get(`/posts?keyword=${keyword}`);
  return response.data;
};

// 2. 유저 검색 API
export const searchUsers = async (keyword) => {
  const response = await client.get(`/users?keyword=${keyword}`);
  return response.data;
};