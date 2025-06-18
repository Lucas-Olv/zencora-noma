import type { AxiosRequestConfig } from "axios";

// Estende AxiosRequestConfig para adicionar propriedades customizadas
export interface CustomAxiosConfig extends AxiosRequestConfig {
  withAuth?: boolean; // Permite desativar a injeção do token
  __isRetryRequest?: boolean; // Usado internamente para controlar retries do refresh
  __retryCount?: number; // Contador de tentativas de retry
}

export type Subscription = {
  id: string;
  status: string;
  plan: string;
  startedAtt: string;
  expiresAt: string;
  product?: { name: string; app_icon: string };
  gracePeriodUntil?: string;
  isTrial: boolean;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  paymentFailedAt?: string;
  productId?: string;
  userId?: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  eventCredits?: number;
  workspaceSlug?: string;
  profilePicture?: string;
  birthDate?: string;
  cpf?: string;
  cnpj?: string;
  address?: string;
  facebookId?: string;
  lastAccessAt?: string;
  googleId?: string;
  appleId?: string;
  sessionId?: string;
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
  name: string;
  productId: string;
  ownerId: string;
  createdAt: string;
  userAcceptedTerms: boolean;
};

export type Settings = {
  id: string;
  tenantId: string;
  enableRoles: boolean;
  lockReportsByPassword: boolean;
  requirePasswordToSwitchRole: boolean;
  lockSettingsByPassword: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: string;
  code: string;
  name: string;
  createdAt: string;
  longDescription?: string;
  type: string;
  url?: string;
  shortDescription: string;
  appIcon?: string;
};

export type Collaborator = {
  id: string;
  name: string;
  email: string;
  password: string;
  tenantId: string;
  invitedByUserId?: string;
  status: 'active' | 'pending' | 'revoked';
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  canAccessReports: boolean;
  canAccessCalendar: boolean;
  canAccessProduction: boolean;
  canAccessOrders: boolean;
  canAccessReminders: boolean;
  canAccessSettings: boolean;
  canAccessDashboard: boolean;
  canCreateOrders: boolean;
  canDeleteOrders: boolean;
  canEditOrders: boolean;
};

export type Order = {
  id: string;
  clientName: string;
  description: string;
  dueDate: string;
  price: string;
  status: string;
  tenantId: string;
  clientPhone?: string;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
};

export type Reminder = {
  id: string;
  tenantId: string;
  title: string;
  isDone: boolean;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type Receipt = {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  paidAt: string;
  externalReference: string;
  productId: string;
  invoiceUrl: string;
  issuedAt: string;
  planType: string;
  userId: string;
  createdAt: string;
};
