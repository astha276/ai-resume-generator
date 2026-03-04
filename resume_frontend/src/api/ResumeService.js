import axios from "axios";

// Base URL for your backend
export const baseURL = "http://localhost:8080";

// Create axios instance with default config
export const axiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true,
  timeout: 1200000,
});

// Add a request interceptor to include token in all requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${response.status} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Response Error:', {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
        message: error.message
      });
    }
    
    if (error.response?.status === 401) {
      // Unauthorized - token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login page if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timeout. Please try again.'));
    }
    
    if (!error.response) {
      return Promise.reject(new Error('Network error. Please check if backend is running.'));
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
    }, {
      headers: { 'Content-Type': 'application/json' }
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
    console.error('Registration error:', error);
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Registration failed';
    throw new Error(errorMessage);
  }
};

// Login user
export const login = async (credentials) => {
  try {
    const response = await axios.post(`${baseURL}/api/auth/login`, {
      email: credentials.email,
      password: credentials.password
    }, {
      headers: { 'Content-Type': 'application/json' }
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
    console.error('Login error:', error);
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Login failed';
    throw new Error(errorMessage);
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
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
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

// Generate new resume
export const generateResume = async (description) => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }
    
    const response = await axiosInstance.post("/api/v1/resume/generate", {
      userDescription: description,
    });
    
    if (typeof response.data === 'string') {
      try {
        return JSON.parse(response.data);
      } catch (parseError) {
        return { data: response.data };
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('Resume generation error:', error);
    
    if (error.response) {
      throw new Error(error.response.data?.message || 'Server error: ' + error.response.status);
    } else if (error.request) {
      throw new Error('No response from server. Please check if backend is running.');
    } else {
      throw new Error(error.message || 'Failed to generate resume');
    }
  }
};

// Test AI connection
export const testAIConnection = async () => {
  try {
    const response = await axios.get(`${baseURL}/api/v1/resume/test-ai`);
    return response.data;
  } catch (error) {
    console.error('AI test failed:', error);
    return 'AI test failed';
  }
};

/**
 * ============================================
 * RESUME HISTORY & MANAGEMENT SERVICE
 * ============================================
 */

// Get all resumes for current user
export const getResumeHistory = async () => {
  try {
    const response = await axiosInstance.get("/api/v1/resumes");
    return response.data;
  } catch (error) {
    console.error('Error fetching resume history:', error);
    throw error;
  }
};

// Get single resume by ID
export const getResumeById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/v1/resumes/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching resume:', error);
    throw error;
  }
};

// Delete resume
export const deleteResume = async (id) => {
  try {
    await axiosInstance.delete(`/api/v1/resumes/${id}`);
  } catch (error) {
    console.error('Error deleting resume:', error);
    throw error;
  }
};

// Update resume (title, tags, favorite)
export const updateResume = async (id, updateData) => {
  try {
    const response = await axiosInstance.put(`/api/v1/resumes/${id}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating resume:', error);
    throw error;
  }
};

// Update specific section of a resume
export const updateResumeSection = async (id, section, content) => {
  try {
    const response = await axiosInstance.patch(`/api/v1/resumes/${id}/section`, {
      section: section,
      content: JSON.stringify(content)
    });
    return response.data;
  } catch (error) {
    console.error('Error updating section:', error);
    throw error;
  }
};

// Regenerate a specific section using AI
export const regenerateSection = async (id, section, prompt, context = '') => {
  try {
    const response = await axiosInstance.post(`/api/v1/resumes/${id}/regenerate/${section}`, {
      prompt: prompt,
      context: context,
      section: section
    });
    return response.data;
  } catch (error) {
    console.error('Error regenerating section:', error);
    throw error;
  }
};

// Update skills
export const updateSkills = async (id, skills) => {
  try {
    const response = await axiosInstance.put(`/api/v1/resumes/${id}/skills`, skills);
    return response.data;
  } catch (error) {
    console.error('Error updating skills:', error);
    throw error;
  }
};

// Toggle favorite status
export const toggleFavorite = async (id) => {
  try {
    await axiosInstance.patch(`/api/v1/resumes/${id}/favorite`);
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
};

// Get user statistics
export const getResumeStats = async () => {
  try {
    const response = await axiosInstance.get("/api/v1/resumes/stats");
    return response.data;
  } catch (error) {
    console.error('Error getting stats:', error);
    throw error;
  }
};

// Get recent resumes
export const getRecentResumes = async (limit = 5) => {
  try {
    const response = await axiosInstance.get(`/api/v1/resumes/recent?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recent resumes:', error);
    throw error;
  }
};

// Get favorite resumes
export const getFavoriteResumes = async () => {
  try {
    const response = await axiosInstance.get("/api/v1/resumes/favorites");
    return response.data;
  } catch (error) {
    console.error('Error fetching favorites:', error);
    throw error;
  }
};

// Search resumes
export const searchResumes = async (query) => {
  try {
    const response = await axiosInstance.get(`/api/v1/resumes/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching resumes:', error);
    throw error;
  }
};

// Add these to your existing ResumeService.js

// Analyze resume for job target
export const analyzeResumeForJob = async (request) => {
  try {
    const response = await axiosInstance.post("/api/v1/suggestions/analyze", request);
    return response.data;
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw error;
  }
};

// Get sample suggestions (for testing)
export const getSampleSuggestions = async () => {
  try {
    const response = await axiosInstance.get("/api/v1/suggestions/sample");
    return response.data;
  } catch (error) {
    console.error('Error getting sample:', error);
    throw error;
  }
};

// Default export with all methods
export default {
  // Auth methods
  register,
  login,
  checkEmail,
  getCurrentUser,
  getToken,
  isLoggedIn,
  logout,
  
  // Resume generation
  generateResume,
  testAIConnection,
  
  // Resume history & management
  getResumeHistory,
  getResumeById,
  deleteResume,
  updateResume,
  updateResumeSection,
  regenerateSection,
  updateSkills,
  toggleFavorite,
  getResumeStats,
  getRecentResumes,
  getFavoriteResumes,
  searchResumes,

  analyzeResumeForJob,
  getSampleSuggestions
};