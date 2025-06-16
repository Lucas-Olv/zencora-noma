import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  productsService,
  rolesService,
  settingsService,
  TenantType,
  supabaseService,
  usersService,
  ProductType,
  tenantsService,
  subscriptionsService,
  SettingsType,
  AppSessionType,
  appSessionsService,
} from "@/services/supabaseService";
import { Session, User } from "@supabase/supabase-js";
import { Tables } from "@/integrations/supabase/types";
import dayjs from "dayjs";
import { db } from "@/lib/db";
import { useProductStore } from "@/storage/product";
import { useSessionStore } from "@/storage/session";
import { useSubscriptionStorage } from "@/storage/subscription";

type Tenant = Tables<"tenants">;
type Settings = Tables<"settings">;
type RoleType = Tables<"roles">;
type SubscriptionType = Tables<"subscriptions">;

interface WorkspaceContextType {
  user: User | null;
  session: Session | null;
  tenant: Tenant | null;
  setTenant: (tenant: Tenant | null) => void;
  appSession: AppSessionType | null;
  setAppSession: (appSession: AppSessionType | null) => void;
  settings: Settings | null;
  setSettings: (settings: Settings | null) => void;
  updateSettings: (newSettings: Settings) => void;
  isAuthenticated: boolean;
  selectedRole: RoleType | null;
  setSelectedRole: (role: RoleType | null) => void;
  error: string | null;
  subscription: SubscriptionType | null;
  isLoading: boolean;
  isTrial: boolean;
  isActive: boolean;
  isExpired: boolean;
  isPaymentFailed: boolean;
  isBlocked: boolean;
  showWarning: boolean;
  roles: RoleType[];
  reloadSettings: () => void;
  isOwner: boolean;
  product: ProductType | null;
  inGracePeriod: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined,
);

export const WorkspaceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionType | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const now = dayjs();
  const expiresAt = subscription?.expires_at
    ? dayjs(subscription.expires_at)
    : null;
  const graceUntil = subscription?.grace_period_until
    ? dayjs(subscription.grace_period_until)
    : null;
  const isTrial = subscription?.status === "trial";
  const isActive = subscription?.status === "active";
  const isCancelled = subscription?.status === "cancelled";
  const isPaymentFailed = subscription?.status === "payment_failed";
  const isExpired = expiresAt ? now.isAfter(expiresAt) : false;
  const inGracePeriod = graceUntil ? now.isBefore(graceUntil) : false;
  const [roles, setRoles] = useState<RoleType[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const ROLE_STORAGE_KEY = "active_role_id";
  const workspaceStartedSync = useRef(false);
  const [appSession, setAppSession] = useState<AppSessionType | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [product, setProduct] = useState<ProductType | null>(null);
    // Bloqueia se:
  // 1. Está expirado e fora do período de graça
  // 2. Tem falha de pagamento
  // 3. Está cancelado
  // 4. Não tem assinatura
  const isBlocked =
    !subscription ||
    (isPaymentFailed && !inGracePeriod) ||
    isCancelled ||
    (isExpired && !inGracePeriod);

  // Mostra alerta se está prestes a expirar ou com falha de pagamento
  const showWarning =
    (expiresAt && expiresAt.diff(now, "day") <= 3 && !isBlocked) ||
    isPaymentFailed;

  useEffect(() => {

    const loadWorkspace = async ()  => {
    setIsLoading(true);
        await db.init();
        await useProductStore.getState().loadProduct();
        await useSessionStore.getState().restoreSession();
        await useSubscriptionStorage.getState().loadSubscription();
        setIsLoading(false);
    }

    loadWorkspace();
    return;
  }, []);

  const reloadSettings = async () => {
    if (!tenant?.id) {
      setIsLoading(false);
      return;
    }

    try {
      // Se estiver bloqueado e não for pro/enterprise/trial, retorna sem buscar settings
      if (
        isBlocked &&
        subscription?.plan !== "pro" &&
        subscription?.plan !== "enterprise" &&
        !subscription?.is_trial
      ) {
        setSettings(null);
        setRoles([]);
        setIsOwner(true);
        setIsLoading(false);
        return;
      }

      const { data: settingsData, error: settingsError } =
        await settingsService.getTenantSettings(tenant.id);
      if (settingsError) throw settingsError;

      setSettings(settingsData);

      // Só busca roles se a funcionalidade estiver ativada
      if (settingsData?.enable_roles) {
        const { data: rolesData, error: rolesError } =
          await rolesService.getTenantRoles(tenant.id);
        if (rolesError) throw rolesError;
        setRoles(rolesData || []);
      } else {
        setRoles([]);
      }

      // Verifica role ativa no localStorage
      const savedRoleId = localStorage.getItem(ROLE_STORAGE_KEY);
      if (savedRoleId === null) {
        // Se não há role salva, é owner
        setIsOwner(true);
      } else {
        const found = roles.find((r) => r.id === savedRoleId);
        if (found) {
          setIsOwner(false);
        } else {
          // Se a role salva não existe mais, limpa e define como owner
          localStorage.removeItem(ROLE_STORAGE_KEY);
          setIsOwner(true);
        }
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      // Em caso de erro, limpa os dados e define como owner
      setSettings(null);
      setRoles([]);
      setIsOwner(true);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Settings) => {
    try {
      const { data: updatedSettings, error } =
        await settingsService.upsertSettings(newSettings);
      if (error) throw error;

      // Atualiza apenas as settings sem recarregar todo o estado
      setSettings(updatedSettings);

      // Se a mudança afetar roles, atualiza o estado de roles
      if (updatedSettings.enable_roles !== settings?.enable_roles) {
        if (updatedSettings.enable_roles) {
          const { data: rolesData, error: rolesError } =
            await rolesService.getTenantRoles(tenant!.id);
          if (rolesError) throw rolesError;
          setRoles(rolesData || []);
        } else {
          setRoles([]);
          setIsOwner(true);
          localStorage.removeItem(ROLE_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      throw error;
    }
  };


  return (
    <WorkspaceContext.Provider
      value={{
        user,
        session,
        isAuthenticated,
        appSession,
        setAppSession,
        selectedRole,
        setSelectedRole,
        tenant,
        setTenant,
        settings,
        setSettings,
        updateSettings,
        error,
        subscription,
        isLoading,
        isTrial,
        isActive,
        isExpired,
        isPaymentFailed,
        isBlocked,
        showWarning,
        roles,
        reloadSettings,
        isOwner,
        product,
        inGracePeriod,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

const useWorkspaceContext = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error(
      "useWorkspace precisa ser usado dentro do WorkspaceProvider",
    );
  }
  return context;
};

export { useWorkspaceContext };
