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

export interface GetNearbyGamesResponse {
  success: boolean;
  data: Game[];
}

export interface GameResponse {
  success: boolean;
  data: Game;
}
