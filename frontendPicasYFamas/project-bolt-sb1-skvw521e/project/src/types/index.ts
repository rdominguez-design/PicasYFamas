export interface User {
  email: string;
  name: string;
  lastName: string;
  age: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface StartGameResponse {
  gameId: string;
  message: string;
}

export interface GuessResponse {
  attemptNumber: number;
  attemptedNumber: string;
  picas: number;
  famas: number;
  message: string;
  isWinner: boolean;
}

export interface Attempt {
  attemptNumber: number;
  attemptedNumber: string;
  picas: number;
  famas: number;
  message: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}
