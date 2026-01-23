import axios from "axios";

// Hardcoded for testing - remove localhost completely
const API_URL = "https://brotherhood-backend-1.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { 
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
});

export default api;