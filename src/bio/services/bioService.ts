import { BioPaper, BioPaperResponse } from '../models/BioPaper';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const bioService = {
  async getAllBiologyPapers(): Promise<BioPaper[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/FindAll/Biology/Papers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('API Response:', data); // Debug log
      
      // Handle different response formats
      // If data is already an array
      if (Array.isArray(data)) {
        return data;
      }
      
      // If data has a success property
      if (data.success && data.data) {
        return data.data;
      }
      
      // If data has a data property without success
      if (data.data && Array.isArray(data.data)) {
        return data.data;
      }
      
      // If none of the above, throw error
      throw new Error('Unexpected response format');
    } catch (error) {
      console.error('Error fetching biology papers:', error);
      throw error;
    }
  },
};