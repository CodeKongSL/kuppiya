import { PhysicsPaper, PhysicsPapersResponse } from '../models/PhysicsPaper';
import { PhysicsQuestion, PhysicsQuestionResponse } from '../models/PhysicsQuestion';
import { api } from '@/services/apiClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://paper-system-api.codekongsl.com';

export const physicsService = {
  // Get all physics papers
  async getAllPapers(): Promise<PhysicsPaper[]> {
    try {
      const response = await api.get('/FindAll/Physics/Papers');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Physics Papers API Response:', data);
      
      // Handle different response structures
      if (data.success && data.data) {
        return data.data;
      } else if (Array.isArray(data)) {
        return data;
      } else if (data.data && Array.isArray(data.data)) {
        return data.data;
      }
      
      throw new Error(data.message || 'Failed to fetch physics papers');
    } catch (error) {
      console.error('Error fetching physics papers:', error);
      throw error;
    }
  },

  // Get a specific question by paper ID and question number
  async getQuestionByNumber(paperId: string, questionNumber: number): Promise<PhysicsQuestion> {
    try {
      const response = await api.get(
        `/Find/Question/Id?paper_id=${paperId}&question_number=${questionNumber}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Physics Question API Response:', data);
      
      // Extract the question object from possible response formats
      let question: any = null;
      if (data.success && data.data) {
        question = data.data;
      } else if (data.data) {
        question = data.data;
      } else if (data.question_number) {
        question = data;
      }

      if (!question) {
        throw new Error('Unexpected response format');
      }

      // Transform Google Drive links to thumbnail URLs (bypasses CORS)
      if (question.question_images && Array.isArray(question.question_images)) {
        question.question_images = question.question_images.map((url: string) => {
          // Convert Google Drive view links to thumbnail links
          const match = url.match(/\/file\/d\/([^\/]+)\//);
          if (match && match[1]) {
            // Use Google Drive thumbnail API with large size (sz=w1000 for width 1000px)
            return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
          }
          return url;
        });
      }

      // Ensure options have the correct Media format
      if (Array.isArray(question.options)) {
        question.options = question.options.map((option: any) => {
          // If option is already in the correct format, return as is
          if (option && typeof option === 'object' && option.type) {
            // Transform image URLs in options if needed
            if (option.type === 'image' && option.url) {
              const match = option.url.match(/\/file\/d\/([^\/]+)\//);
              if (match && match[1]) {
                return {
                  ...option,
                  url: `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`
                };
              }
            }
            return option;
          }
          // If option is a string, convert to Media format
          return {
            type: 'text' as const,
            text: option
          };
        });
      }

      return question;
    } catch (error) {
      console.error('Error fetching question:', error);
      throw error;
    }
  },

  // Get paper metadata
  async getPaperById(paperId: string): Promise<PhysicsPaper> {
    try {
      const response = await api.get(`/FindOne/Physics/Paper/${paperId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        return data.data;
      } else if (data._id) {
        return data;
      }
      
      throw new Error(data.message || 'Failed to fetch paper');
    } catch (error) {
      console.error('Error fetching paper:', error);
      throw error;
    }
  },

  // Get a specific paper by subject and year (lazy loading)
  async getPaperByYear(subject: string, year: string): Promise<PhysicsPaper> {
    try {
      const response = await api.get(
        `/Find/Papers/Subject/Year?subject=${encodeURIComponent(subject)}&year=${encodeURIComponent(year)}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Physics Paper by Year API Response:', data);
      
      // Handle different response structures
      // Check if response has success flag and data
      if (data.success && data.data) {
        return Array.isArray(data.data) ? data.data[0] : data.data;
      }
      // Check if data itself is the paper object
      if (data._id || data.paper_id) {
        return data;
      }
      // Check if data.data is the paper without success flag
      if (data.data) {
        const paperData = Array.isArray(data.data) ? data.data[0] : data.data;
        if (paperData && (paperData._id || paperData.paper_id)) {
          return paperData;
        }
      }
      // Check if response is an array
      if (Array.isArray(data) && data.length > 0) {
        return data[0];
      }
      
      console.error('Unexpected response structure:', data);
      throw new Error(data.message || 'Failed to fetch paper for the specified year');
    } catch (error) {
      console.error(`Error fetching Physics paper for year ${year}:`, error);
      throw error;
    }
  }
};
