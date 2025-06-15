// lib/api.ts
import axios, { AxiosRequestConfig } from "axios";
import type { CustomAxiosConfig } from "./types";
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

nomaApi.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest.__isRetryRequest && originalRequest.__retryCount? originalRequest.__retryCount <= 2 : true) {
      console.warn("[API] Sessão expirada. Tentando refresh...");

          if (error.response?.status === 401 && !originalRequest.__isRetryRequest) {
      originalRequest.__isRetryRequest = true;
      originalRequest.__retryCount = (originalRequest.__retryCount || 0) + 1;

        if (originalRequest.__retryCount > 2) {
        console.warn("[API] Tentativas de refresh excedidas. Limpando sessão.");
        useSessionStore.getState().clearSession();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return nomaApi(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest.__isRetryRequest = true;
      isRefreshing = true;

      try {
        const { data } = await nomaApi.post("/api/core/v1/refresh");
        const newAccessToken= data.data.accessToken;
        useSessionStore.getState().handleTokenRefresh(newAccessToken);
        console.log(data);

        // Processa fila de requisições falhadas
        failedQueue.forEach(p => p.resolve(newAccessToken));
        failedQueue = [];

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return nomaApi(originalRequest);
      } catch (refreshError) {
        failedQueue.forEach(p => p.reject(refreshError));
        failedQueue = [];

        useSessionStore.getState().clearSession();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }}
);



