import api from './axios';

export const getWorkoutPlans = () => api.get('/workout-plans');
export const getWorkoutPlan = (id: string) => api.get(`/workout-plans/${id}`);
export const createWorkoutPlan = (data: any) => api.post('/workout-plans', data);
export const deleteWorkoutPlan = (id: string) => api.delete(`/workout-plans/${id}`);
