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
  grace_period_until?: string;
  isTrial?: boolean;
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
  user_accepted_terms: boolean;
};

export type Settings = {
  id: string;
  tenantId: string;
  settings: string;
  lock_reports_by_password?: boolean;
  lock_settings_by_password?: boolean;
};

export type Product = {
  id: string;
  name: string;
  type: "service" | "saas" | "mobile";
  url: string;
  short_description?: string;
  description?: string;
};
