import api from './axios';
import { LoginCredentials, RegisterData, User, ApiResponse } from '@/types';

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post<ApiResponse<{ user: User; token: string }>>(
      '/auth/login',
      credentials
    );
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await api.post<ApiResponse<{ user: User; token: string }>>(
      '/auth/register',
      data
    );
    return response.data;
  },

  logout: async () => {
    const response = await api.post<ApiResponse<null>>('/auth/logout');
    return response.data;
  },

  updateLocation: async (latitude: number, longitude: number) => {
    const response = await api.put<ApiResponse<User>>('/auth/location', {
      latitude,
      longitude,
    });
    return response.data;
  },
};

