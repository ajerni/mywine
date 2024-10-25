// CURD operations for wines

import { Wine } from './types';

const logError = (message: string, ...args: any[]) => {
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error(message, ...args);
  }
};

export const fetchWines = async (): Promise<Wine[]> => {
  try {
    const response = await fetch('/api/wines');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (Array.isArray(data)) {
      return data;
    } else {
      logError('Unexpected data format:', data);
      return [];
    }
  } catch (error) {
    logError('Error fetching wines:', error);
    return [];
  }
};

export const handleDelete = async (id: number): Promise<boolean> => {
  try {
    const response = await fetch('/api/wines', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return true;
  } catch (error) {
    logError('Error deleting wine:', error);
    return false;
  }
};

export const handleSave = async (updatedWine: Wine): Promise<boolean> => {
  try {
    const response = await fetch('/api/wines', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedWine),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return true;
  } catch (error) {
    logError('Error updating wine:', error);
    return false;
  }
};

export const handleAdd = async (newWineData: Omit<Wine, 'id' | 'user_id'>): Promise<boolean> => {
  try {
    const response = await fetch('/api/wines', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newWineData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}, details: ${errorData.details}`);
    }
    return true;
  } catch (error) {
    logError('Error adding wine:', error);
    return false;
  }
};
