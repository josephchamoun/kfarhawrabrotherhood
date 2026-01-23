import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL, // now already includes /api
  headers: { "Content-Type": "application/json" },
});

export default api;
