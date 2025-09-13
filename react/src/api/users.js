import instance from './axios';

export const getUser = async (id) => {
  const res = await instance.get(`/api/users/${id}`);
  return res.data.data;
};

export const updateUser = async (id, payload) => {
  const res = await instance.put(`/api/users/${id}`, payload);
  return res.data.data;
};

export const searchUsers = async (q) => {
  const res = await instance.get('/api/search/users', { params: { q } });
  return res.data.data;
};
