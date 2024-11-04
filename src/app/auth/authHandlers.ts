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

    const data = await response.json();
    
    if (!response.ok) {
      return { 
        success: false, 
        message: data.error || 'Registration failed' 
      };
    }

    return { 
      success: true, 
      message: 'Registration successful' 
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Registration failed' 
    };
  }
};

export const loginUser = async (
  username: string, 
  password: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { 
        success: false, 
        message: data.error || 'Login failed' 
      };
    }

    if (data.token) {
      localStorage.setItem('token', data.token);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return { success: true, message: 'Login successful' };
    }

    return { 
      success: false, 
      message: 'No token received' 
    };
  } catch (error) {
    console.error('Login error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Login failed' 
    };
  }
};

export const logoutUser = async (): Promise<boolean> => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  return true;
};

export const getCurrentUser = async () => {
  try {
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
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error('Error getting current user:', error);
    if (error instanceof Error && error.message.includes('401')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return null;
  }
};
