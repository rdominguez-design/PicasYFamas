import type { AuthResponse, GuessResponse, RegisterData, StartGameResponse } from '../types';

const API_BASE_URL = "https://localhost:7213";
const NGROK_HEADERS = {
  'ngrok-skip-browser-warning': 'true',
};

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function getToken(): string | null {
  return localStorage.getItem('token');
}

function setToken(token: string): void {
  localStorage.setItem('token', token);
}

function clearToken(): void {
  localStorage.removeItem('token');
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    if (response.status === 401) {
      clearToken();
      throw new ApiError(401, 'Session expired. Please login again.');
    }
    const errorData = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new ApiError(response.status, errorData.message || 'Request failed');
  }
  return response.json();
}

async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...NGROK_HEADERS,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return handleResponse<T>(response);
}

export const api = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetchWithAuth<AuthResponse>('/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setToken(response.token);
    return response;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetchWithAuth<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(response.token);
    return response;
  },

  async startGame(): Promise<StartGameResponse> {
    return fetchWithAuth<StartGameResponse>('/start', {
      method: 'POST',
    });
  },

  async guess(gameId: string, attemptedNumber: string): Promise<GuessResponse> {
    return fetchWithAuth<GuessResponse>('/guess', {
      method: 'POST',
      body: JSON.stringify({ gameId, attemptedNumber }),
    });
  },

  getToken,
  setToken,
  clearToken,
  isAuthenticated: () => !!getToken(),
};

export { ApiError };
