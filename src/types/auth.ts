export interface LoginCredentials {
  name: string;
  password: string;
  locationLat: number;
  locationLng: number;
}

export interface LoginRequest {
  name: string;
  password: string;
  locationLat: number;
  locationLng: number;
}

export interface LoginResponse {
  message: string;
  token: string;
  userId: number;
  name: string;
  createdAt: string;
  hasBall: boolean;
  locationLat: number;
  locationLng: number;
}
