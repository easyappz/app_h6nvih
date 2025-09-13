import instance from './axios';

export const sendRequest = async (userId) => {
  const res = await instance.post(`/api/friends/request/${userId}`);
  return res.data.data;
};

export const acceptRequest = async (userId) => {
  const res = await instance.post(`/api/friends/accept/${userId}`);
  return res.data.data;
};

export const removeFriend = async (userId) => {
  const res = await instance.delete(`/api/friends/${userId}`);
  return res.data.data;
};

export const listFriends = async (userId) => {
  const res = await instance.get(`/api/friends/list/${userId}`);
  return res.data.data;
};

export const listRequests = async () => {
  const res = await instance.get('/api/friends/requests');
  return res.data.data;
};
