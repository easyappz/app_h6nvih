import instance from './axios';

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const res = await instance.post('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
};
