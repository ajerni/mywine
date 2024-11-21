// CURD operations for wines

import { Wine } from './types';

const getAuthToken = () => localStorage.getItem('token');

export const handleDelete = async (id: number): Promise<boolean> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No token found');
    }

    // Delete the wine from the database
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

    // Delete the associated image folder
    const folderResponse = await fetch(`/api/deletepicfolder?wineId=${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!folderResponse.ok) {
      console.error('Failed to delete image folder');
      // Note: We don't throw here as the wine was successfully deleted
    }

    return true;
  } catch (error) {
    console.error('Error deleting wine:', error);
    return false;
  }
};

export const handleSave = async (wine: Wine): Promise<boolean> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch('/api/wines', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: wine.id,
        name: wine.name,
        producer: wine.producer,
        grapes: wine.grapes,
        country: wine.country,
        region: wine.region,
        year: wine.year,
        price: wine.price,
        quantity: wine.quantity,
        note_text: wine.note_text,
        ai_summary: wine.ai_summary,
        bottle_size: wine.bottle_size,
        rating: wine.rating,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save wine');
    }

    return true;
  } catch (error) {
    console.error('Error saving wine:', error);
    return false;
  }
};

export const handleAdd = async (wine: Omit<Wine, 'id'>): Promise<boolean> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch('/api/wines', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: wine.name,
        producer: wine.producer,
        grapes: wine.grapes,
        country: wine.country,
        region: wine.region,
        year: wine.year,
        price: wine.price,
        quantity: wine.quantity,
        note_text: wine.note_text,
        ai_summary: wine.ai_summary,
        bottle_size: wine.bottle_size,
        rating: wine.rating,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to add wine');
    }

    return true;
  } catch (error) {
    console.error('Error adding wine:', error);
    return false;
  }
};
