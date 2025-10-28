import { BioPaper, BioPaperResponse } from '../models/BioPaper';
import { BioQuestion, BioQuestionResponse } from '../models/BioQuestion';

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
      console.log('API Response Type:', typeof data);
      console.log('Is Array:', Array.isArray(data));
      
      // Handle different response formats
      // If data is already an array
      if (Array.isArray(data)) {
        console.log('Using direct array format');
        return data;
      }
      
      // If data has a success property
      if (data.success && data.data) {
        console.log('Using success+data format');
        return data.data;
      }
      
      // If data has a data property without success
      if (data.data && Array.isArray(data.data)) {
        console.log('Using data array format');
        return data.data;
      }

      // If response has papers property
      if (data.papers && Array.isArray(data.papers)) {
        console.log('Using papers array format');
        return data.papers;
      }
      
      // Log the actual structure for debugging
      console.error('Unexpected response format:', JSON.stringify(data, null, 2));
      throw new Error('Unexpected response format');
    } catch (error) {
      console.error('Error fetching biology papers:', error);
      throw error;
    }
  },

  async getQuestionByNumber(paperId: string, questionNumber: number): Promise<BioQuestion> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/Find/Question/Id?paper_id=${paperId}&question_number=${questionNumber}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('Question API Response:', data); // Debug log
      
      // Handle different response formats
      if (data.success && data.data) {
        return data.data;
      }
      
      if (data.data) {
        return data.data;
      }
      
      // If data itself is the question
      if (data.question_number) {
        return data;
      }
      
      throw new Error('Unexpected response format');
    } catch (error) {
      console.error('Error fetching biology question:', error);
      throw error;
    }
  },
};