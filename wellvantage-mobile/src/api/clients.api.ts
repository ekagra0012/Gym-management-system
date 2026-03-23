import api from './axios';

export const getClients = () => api.get('/clients');
export const createClient = (data: { firstName: string; lastName: string; email?: string; phone?: string }) =>
  api.post('/clients', data);
export const deleteClient = (id: string) => api.delete(`/clients/${id}`);
