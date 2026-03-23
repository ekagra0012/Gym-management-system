import api from './axios';

export const getAvailability = () => api.get('/availability');
export const createAvailability = (data: {
  date: string;
  startTime: string;
  endTime: string;
  sessionName?: string;
  isRepeat: boolean;
  repeatDates?: string[];
}) => api.post('/availability', data);
export const deleteAvailability = (id: string) => api.delete(`/availability/${id}`);
