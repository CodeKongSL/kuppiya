import { ChemistryPaper } from '../models/ChemistryPaper';
import { ChemistryQuestion } from '../models/ChemistryQuestion';
import { api } from '@/services/apiClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Cache configuration
const CACHE_KEY = 'chemistry_papers_cache';
const CACHE_EXPIRY_KEY = 'chemistry_papers_cache_expiry';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface CacheData {
  papers: ChemistryPaper[];
  timestamp: number;
}

// Question cache for individual questions
const questionCache = new Map<string, { question: ChemistryQuestion; timestamp: number }>();
const QUESTION_CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours

export const chemistryService = {
  /**
   * Get all chemistry papers with caching support
   * @param forceRefresh - Force fetch from API even if cache is valid
   */
  async getAllChemistryPapers(forceRefresh = false): Promise<ChemistryPaper[]> {
    try {
      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedData = this.getCachedPapers();
        if (cachedData) {
          console.log('Using cached chemistry papers');
          return cachedData;
        }
      }

      console.log('Fetching chemistry papers from API...');
      const response = await api.get('/FindAll/Chemistry/Papers');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle different response formats
      let papers: ChemistryPaper[] = [];
      
      if (Array.isArray(data)) {
        papers = data;
      } else if (data.success && data.data) {
        papers = data.data;
      } else if (data.data && Array.isArray(data.data)) {
        papers = data.data;
      } else if (data.papers && Array.isArray(data.papers)) {
        papers = data.papers;
      } else {
        console.error('Unexpected response format:', JSON.stringify(data, null, 2));
        throw new Error('Unexpected response format');
      }

      // Cache the papers
      this.cachePapers(papers);
      console.log(`Successfully loaded and cached ${papers.length} chemistry papers`);
      
      return papers;
    } catch (error) {
      console.error('Error fetching chemistry papers:', error);
      
      // On error, try to return cached data even if expired
      const cachedData = this.getCachedPapers(true);
      if (cachedData) {
        console.warn('API failed, using expired cache');
        return cachedData;
      }
      
      throw error;
    }
  },

  /**
   * Get a specific question with caching
   */
  async getQuestionByNumber(
    paperId: string, 
    questionNumber: number,
    useCache = true
  ): Promise<ChemistryQuestion> {
    const cacheKey = `${paperId}_${questionNumber}`;
    
    // Check cache first
    if (useCache) {
      const cached = questionCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < QUESTION_CACHE_DURATION) {
        console.log(`Using cached question ${questionNumber}`);
        return cached.question;
      }
    }

    try {
      const response = await api.get(
        `/Find/Question/Id?paper_id=${paperId}&question_number=${questionNumber}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Extract the question object from possible response formats
      let question: any;
      if (data.success && data.data) {
        question = data.data;
      } else if (data.data) {
        question = data.data;
      } else if (data.question_number) {
        question = data;
      } else {
        throw new Error('Unexpected response format');
      }

      // Transform Google Drive links to googleusercontent format (most reliable)
      if (question.question_images && Array.isArray(question.question_images)) {
        question.question_images = question.question_images.map((url: string) => {
          // Convert Google Drive view links to lh3.googleusercontent.com format
          const match = url.match(/\/file\/d\/([^\/]+)\//i);
          if (match && match[1]) {
            // Use lh3.googleusercontent.com with size parameter for better caching
            return `https://lh3.googleusercontent.com/d/${match[1]}=w1200`;
          }
          return url;
        });
      }

      // Ensure options have the correct Media format and transform image URLs
      if (Array.isArray(question.options)) {
        question.options = question.options.map((option: any) => {
          // If option is already in the correct format, return as is
          if (option && typeof option === 'object' && option.type) {
            // Transform image URLs in options if needed
            if (option.type === 'image' && option.url) {
              const match = option.url.match(/\/file\/d\/([^\/]+)\//i);
              if (match && match[1]) {
                return {
                  ...option,
                  url: `https://lh3.googleusercontent.com/d/${match[1]}=w1200`
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

      // Cache the question
      questionCache.set(cacheKey, {
        question,
        timestamp: Date.now()
      });

      return question;
    } catch (error) {
      console.error('Error fetching chemistry question:', error);
      throw error;
    }
  },

  /**
   * Prefetch multiple questions for better performance
   */
  async prefetchQuestions(paperId: string, questionNumbers: number[]): Promise<void> {
    const promises = questionNumbers.map(num => 
      this.getQuestionByNumber(paperId, num).catch(err => {
        console.warn(`Failed to prefetch question ${num}:`, err);
        return null;
      })
    );
    
    await Promise.all(promises);
    console.log(`Prefetched ${questionNumbers.length} questions`);
  },

  /**
   * Get cached papers from localStorage
   */
  getCachedPapers(ignoreExpiry = false): ChemistryPaper[] | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);
      
      if (!cached || !expiry) {
        return null;
      }

      const expiryTime = parseInt(expiry, 10);
      const now = Date.now();

      // Check if cache is still valid
      if (!ignoreExpiry && now > expiryTime) {
        console.log('Cache expired');
        this.clearCache();
        return null;
      }

      const cacheData: CacheData = JSON.parse(cached);
      return cacheData.papers;
    } catch (error) {
      console.error('Error reading cache:', error);
      this.clearCache();
      return null;
    }
  },

  /**
   * Cache papers to localStorage
   */
  cachePapers(papers: ChemistryPaper[]): void {
    try {
      const cacheData: CacheData = {
        papers,
        timestamp: Date.now()
      };
      
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      localStorage.setItem(CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
      console.log('Papers cached successfully');
    } catch (error) {
      console.error('Error caching papers:', error);
      // If localStorage is full, clear old cache
      this.clearCache();
    }
  },

  /**
   * Clear the cache
   */
  clearCache(): void {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_EXPIRY_KEY);
    questionCache.clear();
    console.log('Cache cleared');
  },

  /**
   * Get cache status
   */
  getCacheStatus(): { isCached: boolean; expiresIn: number | null; paperCount: number } {
    const cached = this.getCachedPapers();
    const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);
    
    if (!cached || !expiry) {
      return { isCached: false, expiresIn: null, paperCount: 0 };
    }

    const expiryTime = parseInt(expiry, 10);
    const expiresIn = Math.max(0, expiryTime - Date.now());

    return {
      isCached: true,
      expiresIn,
      paperCount: cached.length
    };
  },

  /**
   * Get a specific paper by subject and year (lazy loading)
   * Used for on-demand loading when user clicks "Start Practice"
   */
  async getPaperByYear(subject: string, year: string): Promise<ChemistryPaper> {
    try {
      const response = await api.get(
        `/Find/Papers/Subject/Year?subject=${encodeURIComponent(subject)}&year=${encodeURIComponent(year)}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Chemistry Paper by Year API Response:', data);
      
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
      console.error(`Error fetching Chemistry paper for year ${year}:`, error);
      throw error;
    }
  }
};
