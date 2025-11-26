import api from './axios';
import { LoginRequest, LoginResponse, User } from '@/types';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/users/login', credentials);
    return response.data;
  },
};
