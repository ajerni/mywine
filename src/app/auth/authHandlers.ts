import { User } from '../wine-cellar/types';

export const registerUser = async (
  username: string,
  email: string,
  password: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      } else {
        const text = await response.text();
        console.error('Non-JSON error response:', text);
        throw new Error('Unexpected server response');
      }
    }

    const data = await response.json();
    return { success: true, message: 'Registration successful' };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Registration failed' };
  }
};

export const loginUser = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      } else {
        const text = await response.text();
        console.error('Non-JSON error response:', text);
        throw new Error('Unexpected server response');
      }
    }

    const data = await response.json();
    if (typeof window !== 'undefined' && data.token) {
      localStorage.setItem('token', data.token);
    }

    return { success: true, message: 'Login successful' };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Login failed' };
  }
};

export const logoutUser = async (): Promise<boolean> => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
  return true;
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    if (typeof window === 'undefined') {
      return null;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    const response = await fetch('/api/users/current', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error fetching current user:', errorData);
      throw new Error(errorData.error || 'Failed to get current user');
    }

    return response.json();
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};
