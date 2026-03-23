import api from './axios';

export const getBookings = () => api.get('/bookings');
export const createBooking = (data: { availabilityId: string; clientId: string }) =>
  api.post('/bookings', data);
export const cancelBooking = (id: string) => api.patch(`/bookings/${id}/cancel`);
