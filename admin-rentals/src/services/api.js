import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5007/api";

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Helper for fetch calls
export const fetchAPI = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    credentials: "include",
    ...options,
  });
  return response;
};

export { API_BASE_URL };
export default API;
