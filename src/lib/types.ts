import type { AxiosRequestConfig } from "axios";

export interface CustomAxiosConfig extends AxiosRequestConfig {
  withAuth?: boolean;
}

export type Subscription = {
  id: string;
  status: string;
  plan: string;
  started_at: string;
  expires_at: string;
  product?: { name: string; app_icon: string };
};

export type User = {
  id: string;
  name: string;
  email: string;
  sessionId: string;
};

export type Session = {
  id: string;
  user: User;
  token: string;
  productId: string;
  subscription?: Subscription;
};

export type Tenant = {
  id: string;
  ownerId: string;
  productId: string;
}

export type Settings = {
  id: string;
  tenantId: string;
  settings: string;
}

export type Product = {
  id: string;
  name: string;
  type: "service" | "saas" | "mobile";
  url: string;
  short_description?: string;
  description?: string;
};