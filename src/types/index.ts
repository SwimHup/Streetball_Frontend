import { LoginRequest, LoginResponse, LoginCredentials } from './auth.ts';
export type { LoginRequest, LoginResponse, LoginCredentials };

export interface User {
  id: number;
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

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}
