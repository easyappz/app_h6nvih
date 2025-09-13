import instance from './axios';

export const register = async (payload) => {
  const res = await instance.post('/api/auth/register', payload);
  return res.data.data;
};

export const login = async (payload) => {
  const res = await instance.post('/api/auth/login', payload);
  return res.data.data;
};

export const me = async () => {
  const res = await instance.get('/api/auth/me');
  return res.data.data;
};
