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
import { supabase } from "@/integrations/supabase/client";
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
  updateRoles: (newRoles: RoleType[]) => void;
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

  const initializeWorkspace = async () => {
    setIsLoading(true);
    workspaceStartedSync.current = true;

    const { session, error } = await supabaseService.auth.getCurrentSession();
    if (!session?.user) {
      cleanWorkspace();
      return;
    }

    try {
      const workspaceData = await db.getWorkspaceData();

      if (!workspaceData?.initialized) {
        await initializeWorkspaceWithSession(session);
        setIsLoading(false);
        return;
      }

      // Recupera appSession com token salvo
      const { data: appSession, error: appSessionError } =
        await appSessionsService.getAppSessionBySessionToken(
          workspaceData.appSession?.session_token,
        );

      if (appSessionError || !appSession) {
        console.warn(
          "Erro ao buscar appSession ou appSession inexistente",
          appSessionError,
        );

        // Somente donos podem usar o app sem appSession
        if (!workspaceData.isOwner) {
          await supabase.auth.signOut();
          return;
        }
      }

      // Verifica app session
      const integrityCheck =
        appSession?.id === workspaceData.appSession?.id &&
        appSession?.tenant_id === workspaceData.appSession?.tenant_id &&
        appSession?.session_token === workspaceData.appSession?.session_token &&
        appSession?.role === workspaceData.appSession?.role &&
        appSession?.expires_at === workspaceData.appSession?.expires_at;

      if (!integrityCheck) {
        console.warn(
          "Violação de integridade detectada: dados não correspondem",
        );
        await supabase.auth.signOut();
        return;
      }

      // Busca os dados mais recentes da assinatura
      const { data: latestSubscription, error: subscriptionError } = await subscriptionsService.getUserSubscription(workspaceData.tenant.owner_id);
      if (!subscriptionError && latestSubscription) {
        setSubscription(latestSubscription);
        // Atualiza também no IndexedDB
        await db.saveWorkspaceData({
          ...workspaceData,
          subscription: latestSubscription
        });
      }
      
      // Verifica o papel da appSession, se existir
      if (appSession?.role_id) {
        const { data: role, error: roleError } = await rolesService.getRoleById(
          appSession.role_id,
        );

        if (roleError || !role) {
          console.warn("Erro ao recuperar role ou role inexistente", roleError);
          await supabase.auth.signOut();
          return;
        }

        const validRole = workspaceData.roles.find((r) => r.id === role.id);

        // Aqui você pode adicionar validações extras (ativo, tipo etc.)
        if (
          !validRole /* || validRole.type === 'forbidden' || !validRole.active */
        ) {
          console.warn("Role inválido ou não pertence ao workspace");
          await supabase.auth.signOut();
          return;
        }

        // Restaura o papel selecionado
        setSelectedRole(role);
        localStorage.setItem(ROLE_STORAGE_KEY, role.id);
      } else if (workspaceData.selectedRole) {
        // Se não tem role_id na appSession mas tem selectedRole no workspaceData
        setSelectedRole(workspaceData.selectedRole);
        localStorage.setItem(ROLE_STORAGE_KEY, workspaceData.selectedRole.id);
      }

      // Tudo certo, atualiza o contexto
      setTenant(workspaceData.tenant);
      setSettings(workspaceData.settings);
      setRoles(workspaceData.roles);
      setIsOwner(workspaceData.isOwner);
      setProduct(workspaceData.product);
      setUser(session.user);
      setSession(session);
      setAppSession(workspaceData.appSession);
      setIsAuthenticated(true);
    } catch (e) {
      console.error("Erro ao inicializar workspace:", e);
      await supabase.auth.signOut();
      cleanWorkspace();
    } finally {
      setIsLoading(false);
    }
  };

  const initializeWorkspaceWithSession = async (session: Session) => {
    try {
      const user = session.user;
      let productData: ProductType | null = null;
      let foundTenantData: TenantType | null = null;
      let foundSettingsData: SettingsType | null = null;
      let foundSubscriptionData: SubscriptionType | null = null;
      let foundAppSessionData: AppSessionType | null = null;

      // 1. Busca o produto "noma"
      try {
        const { data, error } = await productsService.getProductByCode("noma");
        if (error) throw error;
        if (!data) throw new Error("Produto não encontrado");
        productData = data;
      } catch (error: any) {
        console.error("Erro ao buscar produto:", error);
        throw error;
      }

      try {
        const { data: users, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        if (error) throw error;

        if (!users || users.length === 0) {
          const { error: createUserError } =
            await usersService.createUserRecord(
              user.id,
              user.user_metadata?.name ?? "Usuário",
              user.email ?? "",
              "admin",
            );
          if (createUserError) throw createUserError;
        } else if (users.length > 1) {
          console.warn("Usuário com múltiplas entradas — atenção!");
          return;
        }
      } catch (error: any) {
        console.error("Erro ao verificar/criar usuário:", error);
        throw error;
      }

      // 3. Verifica/Cria tenant
      try {
        const { data, error } = await supabase
          .from("tenants")
          .select("*")
          .eq("owner_id", user.id)
          .maybeSingle();
        if (error) throw error;
        foundTenantData = data;
        if (!data) {
          const { error: createTenantError, data: createdTenant } =
            await tenantsService.createTenant(
              user.id,
              `${user.user_metadata?.name ?? "Usuário"}'s Workspace`,
              productData!.id,
            );
          if (createTenantError) throw createTenantError;
          foundTenantData = createdTenant;
        } else {
          foundTenantData = data;
        }
      } catch (error: any) {
        console.error("Erro ao verificar/criar tenant:", error);
        throw error;
      }

      // Garante que tenantData foi preenchido corretamente
      if (!foundTenantData?.id) {
        throw new Error(
          "Tenant ID não definido. Abortando criação dos settings.",
        );
      }

      // 4. Verifica/Cria subscription
      try {
        const { data, error } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        if (error) throw error;
        foundSubscriptionData = data;
        if (!data) {
          const trialUntil = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(); // 7 dias
          const { data: createdSubscription, error: createSubError } =
            await subscriptionsService.createSubscription(
              user.id,
              productData!.id,
              "trial",
              "trial",
              trialUntil,
            );
          if (createSubError) throw createSubError;
          foundSubscriptionData = createdSubscription;
        }
      } catch (error: any) {
        console.error("Erro ao verificar/criar assinatura:", error);
        throw error;
      }

      // 5. Verifica/Cria settings
      try {
        const { data, error } = await supabase
          .from("settings")
          .select("*")
          .eq("tenant_id", foundTenantData.id)
          .maybeSingle();
        if (error) throw error;
        foundSettingsData = data;
        if (!data) {
          const { data: createdSettings, error: createSettingsError } =
            await settingsService.upsertSettings({
              tenant_id: foundTenantData.id,
              enable_roles: false,
              lock_reports_by_password: false,
              lock_settings_by_password: false,
              require_password_to_switch_role: false,
            });
          if (createSettingsError) throw createSettingsError;
          foundSettingsData = createdSettings;
        }
      } catch (error: any) {
        console.error("Erro ao verificar/criar settings:", error);
        throw error;
      }

      // Fetch roles if enabled
      let roles: RoleType[] = [];
      let selectedRole: RoleType | null = null;
      let isOwner = false; // Por padrão, não é owner

      if (foundSettingsData.enable_roles) {
        const { data: rolesData, error: rolesError } =
          await rolesService.getTenantRoles(foundTenantData.id);
        if (!rolesError && rolesData) {
          roles = rolesData;

          // Verifica role ativa no localStorage
          const savedRoleId = localStorage.getItem(ROLE_STORAGE_KEY);
          if (savedRoleId) {
            const found = roles.find((r) => r.id === savedRoleId);
            if (found) {
              selectedRole = found;
              isOwner = false;
            } else {
              // Se a role salva não existe mais, limpa
              localStorage.removeItem(ROLE_STORAGE_KEY);
            }
          }

          // Se não tem role salva e não tem roles disponíveis, então é owner
          if (!savedRoleId && roles.length === 0) {
            isOwner = true;
            const { data: appSessionData, error: appSessionError } =
              await appSessionsService.createAppSession({
                tenant_id: foundTenantData.id,
                role: "owner",
                last_used_at: new Date().toISOString(),
                expires_at: new Date(
                  Date.now() + 7 * 24 * 60 * 60 * 1000,
                ).toISOString(),
              });
            if (appSessionError) throw appSessionError;
            foundAppSessionData = appSessionData;
          }
        }
      } else {
        // Se roles não estiver habilitado, é owner
        isOwner = true;
        localStorage.removeItem(ROLE_STORAGE_KEY);
        const { data: appSessionData, error: appSessionError } =
          await appSessionsService.createAppSession({
            tenant_id: foundTenantData.id,
            role: "owner",
            last_used_at: new Date().toISOString(),
            expires_at: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000,
            ).toISOString(),
          });
        if (appSessionError) throw appSessionError;
        foundAppSessionData = appSessionData;
      }

      // Atualiza todos os estados de uma vez
      setSession(session);
      setUser(user);
      setIsAuthenticated(true);
      setTenant(foundTenantData);
      setProduct(productData);
      setSettings(foundSettingsData);
      setSubscription(foundSubscriptionData);
      setRoles(roles);
      setIsOwner(isOwner);
      setAppSession(foundAppSessionData);

      // Save to IndexedDB
      await db.saveWorkspaceData({
        initialized: true,
        initializedAt: new Date().toISOString(),
        initializedBy: user.id,
        tenant: foundTenantData,
        settings: foundSettingsData,
        subscription: foundSubscriptionData,
        product: productData,
        roles,
        isOwner,
        appSession: foundAppSessionData,
        selectedRole: selectedRole,
      });
    } catch (error: any) {
      console.error("Error initializing workspace:", error);
      setError(error.message);
      // Em caso de erro, limpa todos os estados relacionados a role
      setIsOwner(true);
    }
  };

  const cleanWorkspace = async () => {
    setSession(null);
    setUser(null);
    setTenant(null);
    setSettings(null);
    setSubscription(null);
    setIsAuthenticated(false);
    setIsOwner(true);
    setIsLoading(false);
    workspaceStartedSync.current = false;
    await db.clearWorkspaceData();
    localStorage.removeItem("pwa_install_prompt_shown");
  };

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

  const updateRoles = async (newRoles: RoleType[]) => {
    try {
      // Atualiza apenas os roles sem recarregar todo o estado
      setRoles(newRoles);

      // Se a role selecionada foi removida, limpa a seleção
      if (appSession?.role && !newRoles.find((r) => r.id === appSession.role)) {
        setIsOwner(true);
        localStorage.removeItem(ROLE_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Error updating roles:", error);
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
        updateRoles,
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
