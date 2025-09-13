import instance from './axios';

export const sendMessage = async (userId, payload) => {
  const res = await instance.post(`/api/messages/${userId}`, payload);
  return res.data.data;
};

export const getThread = async (userId, { page = 1, limit = 20 } = {}) => {
  const res = await instance.get(`/api/messages/${userId}`, { params: { page, limit } });
  return res.data.data;
};

export const getConversations = async () => {
  const res = await instance.get('/api/conversations');
  return res.data.data;
};
