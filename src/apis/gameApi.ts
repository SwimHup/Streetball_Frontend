import api from './axios';
import { Game } from '@/types';

export interface CreateGameData {
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  date: string;
  time: string;
  max_players: number;
}

export interface NearbyGamesParams {
  latitude: number;
  longitude: number;
  radius?: number; // km 단위
}

export const gameApi = {
  // 근처 게임 검색
  getNearbyGames: async (params: NearbyGamesParams) => {
    const response = await api.get<Promise<Game[]>>('/games/nearby', {
      params,
    });
    return response.data;
  },

  // 게임 생성
  createGame: async (data: CreateGameData) => {
    const response = await api.post<Promise<Game>>('/games', data);
    return response.data;
  },

  // 게임 상세 조회
  getGame: async (id: number) => {
    const response = await api.get<Promise<Game>>(`/games/${id}`);
    return response.data;
  },

  // 게임 참여
  joinGame: async (gameId: number) => {
    const response = await api.post<Promise<Game>>(`/games/${gameId}/join`);
    return response.data;
  },

  // 게임 나가기
  leaveGame: async (gameId: number) => {
    const response = await api.post<Promise<Game>>(`/games/${gameId}/leave`);
    return response.data;
  },

  // 게임 삭제 (생성자만)
  deleteGame: async (gameId: number) => {
    const response = await api.delete<Promise<null>>(`/games/${gameId}`);
    return response.data;
  },
};
