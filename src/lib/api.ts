// src/lib/api.ts
import axios, { AxiosInstance } from "axios";
import { CustomAxiosConfig } from "./types";
import { useSessionStore } from "@/storage/session";
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

// --- Interceptor de Requisição (Adiciona o Token de Autorização) ---
// Esta função é reutilizável para ambas as instâncias de API
const setupAuthRequestInterceptor = (apiInstance: AxiosInstance) => {
  apiInstance.interceptors.request.use((config) => {
    const customConfig = config as CustomAxiosConfig;

    // A requisição só adicionará o token se `withAuth` não for explicitamente `false`
    // e se não for uma requisição de retry interna do interceptor de refresh.
    // O `__isRetryRequest` é importante para não adicionar o token expirado
    // quando o próprio refresh está sendo tentado.
    const shouldAddAuth =
      customConfig.withAuth !== false && !customConfig.__isRetryRequest;

    if (shouldAddAuth) {
      const token = useSessionStore.getState().token;
      if (token) {
        // Verifica se o token não é nulo/undefined/strings vazias, etc.
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
    }
    return config;
  });
};

// Aplica o interceptor de requisição a ambas as instâncias
setupAuthRequestInterceptor(coreApi);
setupAuthRequestInterceptor(nomaApi);

// --- Interceptor de Resposta (Lógica de Refresh de Token) ---
// Aplica o interceptor de refresh de token a AMBAS as instâncias.
// Isso garante que qualquer 401 de qualquer uma das APIs acione a mesma lógica de refresh.
setupAuthRefreshInterceptor(coreApi);
setupAuthRefreshInterceptor(nomaApi);
