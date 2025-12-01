import api from './axios';
import { GetNearbyGamesResponse, GameResponse, UserGame } from '@/types';

export interface CreateGameData {
  courtId: number;
  creatorUserId: number;
  maxPlayers: number;
  scheduledTime: string;
}

export interface NearbyGamesParams {
  latitude: number;
  longitude: number;
  radius?: number; // km 단위
}

const DEFAULT_RADIUS = 5;

export const gameApi = {
  // 근처 게임 검색
  getNearbyGames: async (params: NearbyGamesParams) => {
    const response = await api.get<GetNearbyGamesResponse>(
      `/games/nearby?lat=${params.latitude}&lng=${params.longitude}&radius=${params.radius || DEFAULT_RADIUS}`,
    );
    return response.data;
  },

  // 게임 생성
  createGame: async (data: CreateGameData): Promise<GameResponse> => {
    const response = await api.post<GameResponse>('/games', data);
    return response.data;
  },

  // 게임 상세 조회
  getGame: async (id: number) => {
    const response = await api.get<GameResponse>(`/games/${id}`);
    return response.data;
  },

  // 게임 참여
  joinGame: async (gameId: number) => {
    const response = await api.post<GameResponse>(`/games/${gameId}/join`);
    return response.data;
  },

  // 게임 나가기
  leaveGame: async (gameId: number) => {
    const response = await api.post<GameResponse>(`/games/${gameId}/leave`);
    return response.data;
  },

  // 게임 삭제 (생성자만)
  deleteGame: async (gameId: number) => {
    const response = await api.delete<Promise<null>>(`/games/${gameId}`);
    return response.data;
  },

  // 진행 중인 참여 게임 조회 (모집_중, 모집_완료)
  getOngoingGames: async (userId: number) => {
    const response = await api.get<UserGame[]>(
      `/users/${userId}/games/ongoing`,
    );
    return response.data;
  },

  // 과거 참여 게임 조회 (게임_종료)
  getPastGames: async (userId: number) => {
    const response = await api.get<UserGame[]>(`/users/${userId}/games/past`);
    return response.data;
  },
};
