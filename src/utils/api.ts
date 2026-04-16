// API utility for making authenticated HTTP requests with token refresh
import config from '../config/global.json';

// Makes API requests with automatic token refresh on 401 errors
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  // Get the access token from localStorage
  const token = localStorage.getItem('token');
  
  // Prepare headers with authorization token if available
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token && { 'Authorization': `Bearer ${token}` })
  };

  // Make the initial API request
  let response = await fetch(url, { ...options, headers });

  // Handle 401 Unauthorized - attempt to refresh token
  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refresh');
    
    if (refreshToken) {
      try {
        // Request a new access token using the refresh token
        const refreshRes = await fetch(`${config.api.host}${config.api.refreshToken}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken })
        });

        if (refreshRes.ok) {
          // Save the new access token
          const data = await refreshRes.json();
          localStorage.setItem('token', data.access);
          
          // Retry the original request with the new token
          headers.Authorization = `Bearer ${data.access}`;
          response = await fetch(url, { ...options, headers });
        } else {
          // Refresh failed - clear storage and redirect to login
          localStorage.clear();
          window.location.href = '/';
        }
      } catch (error) {
        // Error during refresh - clear storage and redirect to login
        localStorage.clear();
        window.location.href = '/';
      }
    } else {
      // No refresh token available - redirect to login
      localStorage.clear();
      window.location.href = '/';
    }
  }

  return response;
};
