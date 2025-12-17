import axios from "axios";

// ⚠️ Replace 'http://localhost:8080' with your actual backend URL
export const baseURL = "http://localhost:8080";

export const axiosInstance = axios.create({
  baseURL: baseURL,
  // Add a responseType to explicitly handle string/text response
  responseType: 'text' 
});

/**
 * Calls the backend to generate a resume based on user description.
 * Expects the backend to return the generated resume as a plain string (text/plain).
 * @param {string} description The professional description input by the user.
 * @returns {Promise<string>} A promise that resolves to the generated resume string.
 */
export const generateResume = async (description) => {
  const response = await axiosInstance.post("/api/v1/resume/generate", {
    userDescription: description,
  });
  
  return response.data; 
};