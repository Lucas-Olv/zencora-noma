// src/lib/interceptors.ts
import { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { useSessionStorage } from "@/storage/session"; // Caminho ajustado
import { CustomAxiosConfig, Session } from "./types"; // Importa a tipagem customizada
import { coreApi } from "./api";
import { verifyToken } from "./jwt";
import { cleanWorkspaceData } from "./utils";

// Variáveis de controle para o refresh de token
let isRefreshing = false;
let failedQueue: {
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}[] = [];

/**
 * Adiciona um interceptor de resposta para lidar com erros 401 (Não Autorizado)
 * e gerenciar o processo de refresh de token.
 * @param api A instância do Axios para a qual o interceptor será aplicado.
 */
export const setupAuthRefreshInterceptor = (api: AxiosInstance) => {
  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as CustomAxiosConfig;

      // Não tenta refresh se a requisição já for o próprio refresh
      if (
        error.response?.status === 401 &&
        !originalRequest.__isRetryRequest &&
        originalRequest.url !== "/api/core/v1/refresh"
      ) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest.__isRetryRequest = true;
        isRefreshing = true;

        try {
          // Chama o refresh diretamente na coreApi
          const { data } = await coreApi.post(
            "/api/core/v1/refresh",
            {},
            {
              withCredentials: true,
            },
          );
          const newAccessToken = data.data.accessToken;
          const payload = await verifyToken(newAccessToken);
          const session: Session = {
            id: payload.sessionId as string,
            user: {
              id: payload.sub as string,
              name: payload.name as string,
              email: payload.email as string,
              sessionId: payload.sessionId as string,
            },
            token: newAccessToken,
            productId: payload.productId as string,
          };

          await useSessionStorage
            .getState()
            .setSession(session, newAccessToken);
          // Processa fila de requisições falhadas
          failedQueue.forEach((p) => p.resolve(newAccessToken));
          failedQueue = [];

          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          failedQueue.forEach((p) => p.reject(refreshError));
          failedQueue = [];

          await cleanWorkspaceData();
          window.location.href = "/login";
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Se não for 401 ou já tentou refresh, rejeita normalmente
      return Promise.reject(error);
    },
  );
};
