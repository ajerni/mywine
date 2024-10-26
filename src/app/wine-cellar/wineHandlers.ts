// CURD operations for wines

import { Wine } from './types';

const getAuthToken = () => localStorage.getItem('token');

export const handleDelete = async (id: number): Promise<boolean> => {
  try {
    const token = getAuthToken();
    const response = await fetch(`/api/wines?id=${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`);
    }
    return true;
  } catch (error) {
    console.error('Error deleting wine:', error);
    return false;
  }
};

export const handleSave = async (updatedWine: Wine): Promise<boolean> => {
  try {
    const token = getAuthToken();
    const response = await fetch('/api/wines', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updatedWine),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error('Error updating wine:', error);
    return false;
  }
};

export const handleAdd = async (newWineData: Omit<Wine, 'id' | 'user_id'>): Promise<boolean> => {
  try {
    const token = getAuthToken();
    const response = await fetch('/api/wines', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(newWineData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`);
    }
    return true;
  } catch (error) {
    console.error('Error adding wine:', error);
    return false;
  }
};
