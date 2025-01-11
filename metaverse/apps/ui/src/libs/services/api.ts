import { STORAGE_KEYS } from "@/constants/storage-keys";
import axios from "axios";

const { TOKE } = STORAGE_KEYS;

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKE);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
