import { coreApi, nomaApi } from "./api";
import type { CustomAxiosConfig } from "./types";

// Helpers genéricos para lidar com a Core API
export const getCoreApiPublic = <T = any>(
  url: string,
  config: CustomAxiosConfig = {},
): Promise<T> => {
  return coreApi
    .get<T>(url, { withAuth: false, ...config })
    .then((res) => res.data);
};

export const postCoreApiPublic = <T = any>(
  url: string,
  data?: any,
  config: CustomAxiosConfig = {},
): Promise<T> => {
  return coreApi
    .post<T>(url, data, { withAuth: false, ...config })
    .then((res) => res.data);
};

export const patchCoreApiPublic = <T = any>(
  url: string,
  data?: any,
  config: CustomAxiosConfig = {},
): Promise<T> => {
  return coreApi
    .patch<T>(url, data, { withAuth: false, ...config })
    .then((res) => res.data);
};

export const postCoreApi = <T = any>(
  url: string,
  data?: any,
  config: CustomAxiosConfig = { withCredentials: true },
): Promise<T> => {
  return coreApi
    .post<T>(url, data, { withCredentials: true, ...config })
    .then((res) => res.data);
};

export const getCoreApi = <T = any>(
  url: string,
  config: CustomAxiosConfig = { withCredentials: true },
): Promise<T> => {
  return coreApi.get<T>(url, config).then((res) => res.data);
};

// Helpers genéricos para lidar com a Noma API
export const getNomaApi = <T = any>(
  url: string,
  config: CustomAxiosConfig = { withCredentials: true },
): Promise<T> => {
  return nomaApi.get<T>(url, config).then((res) => res.data);
};

export const postNomaApi = <T = any>(
  url: string,
  data?: any,
  config: CustomAxiosConfig = { withCredentials: true },
): Promise<T> => {
  return nomaApi
    .post<T>(url, data, { withCredentials: true, ...config })
    .then((res) => res.data);
};

export const putNomaApi = <T = any>(
  url: string,
  data?: any,
  config: CustomAxiosConfig = { withCredentials: true },
): Promise<T> => {
  return nomaApi
    .put<T>(url, data, { withCredentials: true, ...config })
    .then((res) => res.data);
};

export const patchNomaApi = <T = any>(
  url: string,
  data?: any,
  config: CustomAxiosConfig = {},
): Promise<T> => {
  return nomaApi
    .patch<T>(url, data, { withCredentials: true, ...config })
    .then((res) => res.data);
};

export const delNomaAPi = <T = any>(
  url: string,
  config: CustomAxiosConfig = {},
): Promise<T> => {
  return nomaApi
    .delete<T>(url, { withCredentials: true, ...config })
    .then((res) => res.data);
};
