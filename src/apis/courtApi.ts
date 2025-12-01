import api from './axios';
import { Court } from '@/types';

export const courtApi = {
  getCourts: async () => {
    const response = await api.get<Court[]>('/courts');
    return response.data;
  },
};
