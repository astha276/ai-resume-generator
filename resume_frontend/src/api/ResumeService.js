import axios from "axios";

// Base URL for your backend
export const baseURL = "http://localhost:8080";

// Create axios instance with default config
export const axiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true,
});

// Add a request interceptor to include token in all requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login page if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Authentication Service
 */

// Register new user
export const register = async (userData) => {
  try {
    const response = await axios.post(`${baseURL}/api/auth/register`, {
      fullName: userData.fullName,
      email: userData.email,
      password: userData.password
    });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.id,
        email: response.data.email,
        fullName: response.data.fullName
      }));
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Registration failed' };
  }
};

// Login user
export const login = async (credentials) => {
  try {
    const response = await axios.post(`${baseURL}/api/auth/login`, {
      email: credentials.email,
      password: credentials.password
    });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.id,
        email: response.data.email,
        fullName: response.data.fullName
      }));
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Login failed' };
  }
};

// Check if email exists
export const checkEmail = async (email) => {
  try {
    const response = await axios.get(`${baseURL}/api/auth/check-email/${email}`);
    return response.data.exists;
  } catch (error) {
    console.error('Email check error:', error);
    return false;
  }
};

// Get current user from localStorage
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

// Get token
export const getToken = () => {
  return localStorage.getItem('token');
};

// Check if user is logged in
export const isLoggedIn = () => {
  return !!localStorage.getItem('token');
};

// Logout user
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Resume Generation Service
 */

/**
 * Calls the backend to generate a resume based on user description.
 * @param {string} description The professional description input by the user.
 * @returns {Promise<object>} A promise that resolves to the generated resume object.
 */
export const generateResume = async (description) => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }
    
    const response = await axiosInstance.post("/api/v1/resume/generate", {
      userDescription: description,
    });
    
    // If response is string, try to parse it as JSON
    if (typeof response.data === 'string') {
      try {
        return JSON.parse(response.data);
      } catch (parseError) {
        // If it's not valid JSON, return as is with a wrapper
        return { data: response.data };
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('Resume generation error:', error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new Error(error.response.data?.message || 'Server error: ' + error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response from server. Please check if backend is running.');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(error.message || 'Failed to generate resume');
    }
  }
};

/**
 * Get user's resume history (if implemented in backend)
 */
export const getResumeHistory = async () => {
  try {
    const response = await axiosInstance.get("/api/v1/resume/history");
    return response.data;
  } catch (error) {
    console.error('Failed to fetch resume history:', error);
    throw error;
  }
};

/**
 * Test AI connection
 */
export const testAIConnection = async () => {
  try {
    const response = await axios.get(`${baseURL}/api/v1/resume/test-ai`);
    return response.data;
  } catch (error) {
    console.error('AI test failed:', error);
    return 'AI test failed';
  }
};

// Default export with all methods
export default {
  register,
  login,
  checkEmail,
  generateResume,
  getResumeHistory,
  testAIConnection,
  getCurrentUser,
  getToken,
  isLoggedIn,
  logout
};