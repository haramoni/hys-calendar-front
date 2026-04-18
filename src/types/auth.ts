export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    email: string;
    role: string;
  };
}

export interface MeResponse {
  user: {
    email: string;
    role: string;
    iat?: number;
    exp?: number;
    sub?: string;
  };
}
