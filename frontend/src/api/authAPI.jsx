import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const authAPI = axios.create({
  baseURL: `${API_BASE_URL}/api/auth`,
  headers: { 
    "Content-Type": "application/json",
    "Accept": "application/json"
  }
});

export default authAPI;
