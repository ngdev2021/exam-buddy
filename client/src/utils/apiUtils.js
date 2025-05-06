/**
 * Handles API responses and standardizes error handling
 * @param {Response} response - The fetch API response
 * @param {string} defaultErrorMessage - Default error message if none is provided by the server
 * @returns {Promise<any>} - The parsed response data
 * @throws {Error} - If the response is not ok
 */
export async function handleApiResponse(response, defaultErrorMessage = 'An error occurred') {
  // If response is not ok, try to parse error message
  if (!response.ok) {
    let errorMessage = defaultErrorMessage;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || defaultErrorMessage;
    } catch (e) {
      // If we can't parse JSON, use status text or default message
      errorMessage = response.statusText || defaultErrorMessage;
    }
    const error = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }
  
  // If response is ok, parse and return data
  try {
    return await response.json();
  } catch (e) {
    // If we can't parse JSON but response was ok, return empty object
    return {};
  }
}

/**
 * Creates a custom hook for making API requests with authentication
 * @returns {Object} - API utility functions
 */
export function useApi() {
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };
  
  /**
   * Makes an authenticated API request
   * @param {string} url - The URL to fetch
   * @param {Object} options - Fetch options
   * @returns {Promise<any>} - The parsed response data
   */
  const apiRequest = async (url, options = {}) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options.headers,
      };
      
      const response = await fetch(url, {
        ...options,
        headers,
      });
      
      return await handleApiResponse(response);
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  };
  
  return {
    get: (url) => apiRequest(url, { method: 'GET' }),
    post: (url, data) => apiRequest(url, { 
      method: 'POST',
      body: JSON.stringify(data),
    }),
    put: (url, data) => apiRequest(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (url) => apiRequest(url, { method: 'DELETE' }),
  };
}
