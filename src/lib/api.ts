import axios from "axios";

export const api = axios.create({
  baseURL: "http://72.60.249.244:3333",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hys_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
