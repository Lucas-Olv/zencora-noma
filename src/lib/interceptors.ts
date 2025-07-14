// src/lib/interceptors.ts
import { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { useSessionStore } from "@/storage/session"; // Caminho ajustado
import { CustomAxiosConfig, Session } from "./types"; // Importa a tipagem customizada
import { coreApi } from "./api";
import { verifyToken } from "./jwt";

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
      // Converte o config para o nosso tipo customizado para acessar __isRetryRequest e __retryCount
      const originalRequest = error.config as CustomAxiosConfig;

      // Verifica se é um erro 401 e não é uma requisição de retry já marcada
      if (error.response?.status === 401 && !originalRequest.__isRetryRequest) {
        console.warn("[API] Sessão expirada. Tentando refresh...");

        // Marca a requisição original como uma tentativa de retry
        originalRequest.__isRetryRequest = true;
        originalRequest.__retryCount = (originalRequest.__retryCount || 0) + 1;

        // Se exceder o limite de retries, limpa a sessão e redireciona
        if (originalRequest.__retryCount > 0) {
          console.warn(
            "[API] Tentativas de refresh excedidas. Limpando sessão.",
          );
          useSessionStore.getState().clearSession();
          window.location.href = "/login"; // Redireciona para a página de login
          return Promise.reject(error); // Rejeita a requisição original
        }

        // Se já houver um refresh em andamento, enfileira a requisição atual
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              // Quando o refresh terminar, re-adiciona o novo token à requisição original
              originalRequest.headers!.Authorization = `Bearer ${token}`;
              // E então tenta a requisição original novamente
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err)); // Propaga qualquer erro do refresh para a requisição enfileirada
        }

        // Inicia o processo de refresh
        isRefreshing = true;

        try {
          // Faz a requisição para o endpoint de refresh.
          // Importante: Esta requisição **não** deve depender de um token de acesso expirado.
          // Idealmente, ela usa um refresh token em um cookie HTTP-only (com withCredentials: true).
          // Se sua API de refresh exige o `accessToken` expirado, a lógica precisaria de ajuste.
          const { data } = await coreApi.post(
            "/api/core/v1/refresh",
            {},
            {
              withCredentials: true, // Garante que cookies são enviados (incluindo o refresh token)
              // Podemos explicitamente desativar a injeção do token para essa requisição
              // se o endpoint de refresh não precisar do `Authorization` header para o `accessToken`.
              // Caso o interceptor de requisição já trate `__isRetryRequest` para não adicionar,
              // isso não seria estritamente necessário aqui, mas é uma boa prática.
              // __isRetryRequest: true, // Já setado na originalRequest. Se fosse uma nova instância Axios, seria útil.
            },
          );

          const newAccessToken = data.data.accessToken;

          // Verifica token e seta nova sessão
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
          useSessionStore.getState().setSession(session, newAccessToken);

          // Processa todas as requisições que estavam na fila com o novo token
          failedQueue.forEach((p) => p.resolve(newAccessToken));
          failedQueue = []; // Limpa a fila

          // Atualiza o token na requisição original e a tenta novamente
          originalRequest.headers!.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error("[API] Erro ao tentar refresh de token:", refreshError);
          // Se o refresh falhar, rejeita todas as requisições enfileiradas
          failedQueue.forEach((p) => p.reject(refreshError));
          failedQueue = [];

          useSessionStore.getState().clearSession(); // Limpa a sessão
          window.location.href = "/login"; // Redireciona para o login
          return Promise.reject(refreshError); // Rejeita o erro original
        } finally {
          isRefreshing = false; // Finaliza o processo de refresh
        }
      }

      // Para outros erros ou 401 que já são retries, simplesmente rejeita
      return Promise.reject(error);
    },
  );
};
