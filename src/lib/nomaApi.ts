// lib/api.ts
import axios from "axios";
import { CustomAxiosConfig } from "./types";
import { useSessionStore } from "@/storage/session";

// Interceptor para lidar com respostas
let isRefreshing = false;
let failedQueue: {
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}[] = [];

export const nomaApi = axios.create({
  baseURL: import.meta.env.VITE_ZENCORA_NOMA_API_URL,
  withCredentials: true, // importante se usar cookies httpOnly
});

// Interceptor para injetar Authorization condicionalmente
nomaApi.interceptors.request.use((config) => {
  const customConfig = config as CustomAxiosConfig;

  // Permite desativar a injeção do token manualmente
  const shouldAddAuth = customConfig.withAuth !== false;

  if (shouldAddAuth) {
    const token = useSessionStore.getState().token;
    if (
      token &&
      token !== "null" &&
      token !== "undefined" &&
      token !== null &&
      token !== undefined
    ) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});