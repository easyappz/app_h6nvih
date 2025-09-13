import instance from './axios';

export const createPost = async (payload) => {
  const res = await instance.post('/api/posts', payload);
  return res.data.data;
};

export const getFeed = async ({ page = 1, limit = 10 } = {}) => {
  const res = await instance.get('/api/posts/feed', { params: { page, limit } });
  return res.data.data;
};

export const getUserPosts = async (userId, { page = 1, limit = 10 } = {}) => {
  const res = await instance.get(`/api/posts/user/${userId}`, { params: { page, limit } });
  return res.data.data;
};

export const toggleLike = async (id) => {
  const res = await instance.post(`/api/posts/${id}/like`);
  return res.data.data;
};

export const addComment = async (id, payload) => {
  const res = await instance.post(`/api/posts/${id}/comment`, payload);
  return res.data.data;
};

export const deletePost = async (id) => {
  const res = await instance.delete(`/api/posts/${id}`);
  return res.data.data;
};
