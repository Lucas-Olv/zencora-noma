// src/lib/api.ts
import axios, { AxiosInstance } from "axios";
import { CustomAxiosConfig } from "./types";
import { useSessionStorage } from "@/storage/session";
import { setupAuthRefreshInterceptor } from "./interceptors"; // Importa o interceptor de refresh

// Cria as instâncias Axios para suas APIs
export const coreApi: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_ZENCORA_CORE_API_URL,
  withCredentials: true, // Importante para lidar com cookies HTTP-only (ex: refresh token)
});

export const nomaApi: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_ZENCORA_NOMA_API_URL,
  withCredentials: true,
});

// --- Interceptor de Resposta (Lógica de Refresh de Token) ---
// Aplica o interceptor de refresh de token a AMBAS as instâncias.
// Isso garante que qualquer 401 de qualquer uma das APIs acione a mesma lógica de refresh.
setupAuthRefreshInterceptor(coreApi);
setupAuthRefreshInterceptor(nomaApi);
