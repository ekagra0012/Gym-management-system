import api from './axios';

export const registerUser = (data: {
  email: string;
  password: string;
  role: 'PT' | 'OWNER';
}) => api.post('/auth/register', data);

export const loginUser = (data: { email: string; password: string }) =>
  api.post('/auth/login', data);

export const getMe = () => api.get('/auth/me');
