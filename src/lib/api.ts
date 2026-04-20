import axios from "axios";

export const api = axios.create();

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hys_token");

  const baseURL = "https://api.hys-expor-stands.com.br/";

  config.baseURL = baseURL;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
