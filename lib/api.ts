const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role?: string;
}

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('auth_token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Try to refresh token
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          localStorage.setItem('auth_token', data.access_token);
          
          // Retry original request with new token
          headers['Authorization'] = `Bearer ${data.access_token}`;
          return fetch(`${API_URL}${endpoint}`, { ...options, headers });
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }

    // If refresh fails, redirect to login
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  return response;
}

export const authAPI = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    
    // Store tokens and user data
    localStorage.setItem('auth_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  },

  register: async (data: RegisterData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    return response.json();
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (refreshToken) {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getProfile: async (): Promise<User> => {
    const response = await fetchWithAuth('/profile');
    
    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    return response.json();
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token');
  },
};

export const walletAPI = {
  getBalance: async () => {
    const response = await fetchWithAuth('/wallet/balance');
    return response.json();
  },

  requestTopup: async (amount: number, paymentReference: string) => {
    const response = await fetchWithAuth('/wallet/request', {
      method: 'POST',
      body: JSON.stringify({ amount, payment_reference: paymentReference }),
    });
    return response.json();
  },
};

export const applicationAPI = {
  list: async () => {
    const response = await fetchWithAuth('/applications');
    return response.json();
  },

  submit: async (data: any) => {
    const response = await fetchWithAuth('/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
