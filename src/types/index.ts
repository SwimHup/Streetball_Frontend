import { LoginRequest, LoginResponse, LoginCredentials } from './auth.ts';
import { Game, GetNearbyGamesResponse, GameResponse } from './game.ts';
import { Court } from './court.ts';

export type { LoginRequest, LoginResponse, LoginCredentials };
export type { Game, GetNearbyGamesResponse, GameResponse };
export type { Court };

export interface User {
  id: number;
  name: string;
  latitude?: number;
  longitude?: number;
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
  name: string;
  password: string;
  hasBall: boolean;
}
