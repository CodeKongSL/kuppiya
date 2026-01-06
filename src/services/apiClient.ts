import { GetTokenSilentlyOptions } from '@auth0/auth0-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ApiClientConfig {
  getAccessToken: (options?: GetTokenSilentlyOptions) => Promise<string>;
}

let apiConfig: ApiClientConfig | null = null;

/**
 * Initialize the API client with Auth0 token getter
 * Call this once in your app after Auth0 is initialized
 */
export const initializeApiClient = (config: ApiClientConfig) => {
  apiConfig = config;
};

/**
 * Make an authenticated API request
 */
export const apiClient = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  try {
    // Get access token from Auth0
    const token = apiConfig 
      ? await apiConfig.getAccessToken()
      : null;

    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add Authorization header if token is available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Make the request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * Helper methods for common HTTP verbs
 */
export const api = {
  get: (endpoint: string, options?: RequestInit) =>
    apiClient(endpoint, { ...options, method: 'GET' }),

  post: (endpoint: string, data?: any, options?: RequestInit) =>
    apiClient(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: (endpoint: string, data?: any, options?: RequestInit) =>
    apiClient(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: (endpoint: string, options?: RequestInit) =>
    apiClient(endpoint, { ...options, method: 'DELETE' }),

  patch: (endpoint: string, data?: any, options?: RequestInit) =>
    apiClient(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),
};

/**
 * Start a paper (notify backend that paper has been started)
 * @param paperId - The ID of the paper to start
 * @returns Response containing paper_answers_id, user_id, paper_id, status, started_at
 */
export const startPaper = async (paperId: string): Promise<any> => {
  try {
    // Get access token from Auth0
    const token = apiConfig 
      ? await apiConfig.getAccessToken()
      : null;

    // Prepare headers with authentication
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add Authorization header if token is available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(
      `https://paper-management-system-nfdl.onrender.com/PaperMgt/api/Start/Paper?paper_id=${paperId}`,
      {
        method: 'POST',
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Paper started successfully:', data);
    return data;
  } catch (error) {
    console.error('Error starting paper:', error);
    throw error;
  }
};

/**
 * Save an answer for a specific question
 * @param paperAnswersId - The paper_answers_id from the startPaper response
 * @param questionNumber - The question number (1-indexed)
 * @param selectedOptionIndex - The selected option index (0-indexed in UI, but API expects 1-indexed)
 * @returns Response containing saved answer details
 */
export const saveAnswer = async (
  paperAnswersId: string,
  questionNumber: number,
  selectedOptionIndex: number
): Promise<any> => {
  try {
    // Get access token from Auth0
    const token = apiConfig 
      ? await apiConfig.getAccessToken()
      : null;

    // Prepare headers with authentication
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add Authorization header if token is available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(
      `https://paper-management-system-nfdl.onrender.com/PaperMgt/api/save/Answer?paper_answers_id=${paperAnswersId}&question_number=${questionNumber}&selected_option_index=${selectedOptionIndex}`,
      {
        method: 'POST',
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Answer saved successfully:', data);
    return data;
  } catch (error) {
    console.error('Error saving answer:', error);
    throw error;
  }
};

/**
 * Check answers for a completed paper
 * @param paperAnswersId - The paper_answers_id from the startPaper response
 * @returns Response containing result_id, user_id, paper_id, and array of results with correct/incorrect info
 */
export const checkAnswers = async (paperAnswersId: string): Promise<any> => {
  try {
    // Get access token from Auth0
    const token = apiConfig 
      ? await apiConfig.getAccessToken()
      : null;

    // Prepare headers with authentication
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add Authorization header if token is available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(
      `https://paper-management-system-nfdl.onrender.com/PaperMgt/api/Check/Answers?paper_answers_id=${paperAnswersId}`,
      {
        method: 'GET',
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Answers checked successfully:', data);
    return data;
  } catch (error) {
    console.error('Error checking answers:', error);
    throw error;
  }
};

/**
 * Get paper result summary for all user's papers
 * @returns Response containing array of paper summaries with statistics
 */
export const getPaperResultSummary = async (): Promise<any> => {
  try {
    // Get access token from Auth0
    const token = apiConfig 
      ? await apiConfig.getAccessToken()
      : null;

    // Prepare headers with authentication
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add Authorization header if token is available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(
      `https://paper-management-system-nfdl.onrender.com/PaperMgt/api/FindAll/Papers/Result/Summary`,
      {
        method: 'GET',
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Paper result summary fetched:', data);
    return data;
  } catch (error) {
    console.error('Error fetching paper result summary:', error);
    throw error;
  }
};

/**
 * Complete a paper (submit the paper)
 * @param paperAnswersId - The paper_answers_id from the startPaper response
 * @returns Response containing completion status
 */
export const completePaper = async (paperAnswersId: string): Promise<any> => {
  try {
    // Get access token from Auth0
    const token = apiConfig 
      ? await apiConfig.getAccessToken()
      : null;

    // Prepare headers with authentication
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add Authorization header if token is available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(
      `https://paper-management-system-nfdl.onrender.com/PaperMgt/api/Complete/Paper?paper_answers_id=${paperAnswersId}`,
      {
        method: 'POST',
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Paper completed successfully:', data);
    return data;
  } catch (error) {
    console.error('Error completing paper:', error);
    throw error;
  }
};
