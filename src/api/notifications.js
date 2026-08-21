// src/api/notifications.js
import client from './client';

export const getNotifications = async () => {
  const response = await client.get('/notifications?size=20');
  return response.data; 
};