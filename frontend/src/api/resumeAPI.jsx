import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const resumeAPI = axios.create({
  baseURL: `${API_BASE_URL}/api/resumes`, 
  headers: { "Content-Type": "multipart/form-data" },
});

// Add token interceptor
resumeAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default resumeAPI;
