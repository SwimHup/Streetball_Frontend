export interface User {
  id: number;
  email: string;
  name: string;
  latitude?: number;
  longitude?: number;
}

export interface Game {
  id: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  date: string;
  time: string;
  max_players: number;
  current_players: number;
  status: 'recruiting' | 'full' | 'completed' | 'cancelled';
  creator_id: number;
  created_at: string;
}

export interface Participation {
  id: number;
  game_id: number;
  user_id: number;
  role: 'creator' | 'player';
  joined_at: string;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

