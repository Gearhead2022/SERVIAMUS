import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_LAN_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: true
});

export default api;