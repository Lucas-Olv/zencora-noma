import { createContext, useContext, useEffect, useState } from "react";
import { rolesService, settingsService, supabaseService } from "@/services/supabaseService";
import { Session, User } from "@supabase/supabase-js";
import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import dayjs from "dayjs";

type Tenant = Tables<"tenants">;
type Settings = Tables<"settings">;
type RoleType = Tables<"roles">;

type SubscriptionStatus =
  | 'trial'
  | 'active'
  | 'cancelled'
  | 'expired'
  | 'payment_failed'
  | 'paused';

type Subscription = {
  status: SubscriptionStatus;
  plan: string;
  started_at: string;
  expires_at: string;
  cancel_at_period_end: boolean;
  cancelled_at?: string | null;
  payment_failed_at?: string | null;
  is_trial: boolean;
  grace_period_until?: string | null;
};


interface WorkspaceContextType {
  user: User | null;
  session: Session | null;
  tenant: Tenant | null;
  setTenant: (tenant: Tenant | null) => void;
  settings: Settings | null;
  setSettings: (settings: Settings | null) => void;
  updateSettings: (newSettings: Settings) => void;
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  error: string | null;
  subscription: Subscription | null;
  isLoading: boolean;
  isTrial: boolean;
  isActive: boolean;
  isExpired: boolean;
  isPaymentFailed: boolean;
  isBlocked: boolean;
  showWarning: boolean;
  tenantError: string | null;
  loadingTenant: boolean;
  roles: RoleType[];
  selectedRole: RoleType | null;
  setSelectedRoleById: (id: string | null) => void;
  reloadSettings: () => void;
  isOwner: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const now = dayjs();
  const expiresAt = subscription?.expires_at ? dayjs(subscription.expires_at) : null;
  const graceUntil = subscription?.grace_period_until ? dayjs(subscription.grace_period_until) : null;
  const isTrial = subscription?.status === 'trial';
  const isActive = subscription?.status === 'active';
  const isCancelled = subscription?.status === 'cancelled';
  const isPaymentFailed = subscription?.status === 'payment_failed';
  const isExpired = expiresAt ? now.isAfter(expiresAt) : false;
  const inGracePeriod = graceUntil ? now.isBefore(graceUntil) : false;
  const [tenantError, setTenantError] = useState<string | null>(null);
  const [loadingTenant, setLoadingTenant] = useState(true);
  const [roles, setRoles] = useState<RoleType[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const ROLE_STORAGE_KEY = 'active_role_id';

  const PRODUCT_CODE = 'noma';

  // Bloqueia se:
  // 1. Está expirado e fora do período de graça
  // 2. Tem falha de pagamento
  // 3. Está cancelado
  // 4. Não tem assinatura
  const isBlocked = !subscription || (isPaymentFailed && !inGracePeriod) || isCancelled || (isExpired && !inGracePeriod);

  // Mostra alerta se está prestes a expirar ou com falha de pagamento
  const showWarning =
    (expiresAt && expiresAt.diff(now, 'day') <= 3 && !isBlocked) || isPaymentFailed;

  // Load session and initial setup
  useEffect(() => {
    initializeWorkspace();
  }, []);

  const initializeWorkspaceWithSession = async (session: Session) => {
    try {
      setLoading(true);

      const user = session.user;

      // Check/Create user record
      const { data: userData, error: userError } = 
        await supabaseService.users.getUserById(user.id);

      if (userError && userError.code !== 'PGRST116') { // PGRST116 is "not found" error
        setError(userError.message);
        return;
      }

      if (!userData) {
        const { error: createUserError } = 
          await supabaseService.users.createUserRecord(
            user.id,
            user.user_metadata?.name ?? 'Usuário',
            user.email ?? '',
            'admin'
          );
        
        if (createUserError) {
          setError(createUserError.message);
          return;
        }
      }

      // Fetch product by code
      const { data: productData, error: productError } = 
        await supabaseService.products.getProductByCode(PRODUCT_CODE);

      if (productError) {
        setError(productError.message);
        return;
      }

      if (!productData) {
        setError("Produto não encontrado");
        return;
      }

      // Fetch or create subscription
      const { data: subscriptionData, error: subscriptionError } = 
        await supabaseService.subscriptions.getUserSubscription(user.id);

      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        setError(subscriptionError.message);
        return;
      }

      let subscription = subscriptionData;
      if (!subscription) {
        const { data: newSubscription, error: createError } = 
          await supabaseService.subscriptions.createSubscription(
            user.id,
            productData.id,
            'trial',
            'trial',
            dayjs().add(7, 'days').toISOString()
          );
        
        if (createError) {
          setError(createError.message);
          return;
        }
        
        subscription = newSubscription;
      }

      // Fetch or create tenant
      const { data: tenantData, error: tenantError } = 
        await supabaseService.tenants.getUserTenant(user.id);

      if (tenantError && tenantError.code !== 'PGRST116') {
        setError(tenantError.message);
        return;
      }

      let tenant = tenantData;
      if (!tenant) {
        const { data: newTenant, error: createError } = 
          await supabaseService.tenants.createTenant(
            user.id,
            `${user.user_metadata?.name ?? 'Usuário'}'s Workspace`,
            productData.id
          );
        
        if (createError) {
          setError(createError.message);
          return;
        }
        
        tenant = newTenant;
      }

      // Fetch or create settings
      const { data: settingsData, error: settingsError } = 
        await settingsService.getTenantSettings(tenant.id);

      if (settingsError && settingsError.code !== 'PGRST116') {
        setError(settingsError.message);
        return;
      }

      let settings = settingsData;
      if (!settings) {
        const { data: newSettings, error: createError } = 
          await settingsService.upsertSettings({
            tenant_id: tenant.id,
            enable_roles: false,
            lock_reports_by_password: false,
            lock_settings_by_password: false,
            require_password_to_switch_role: false
          });
        
        if (createError) {
          setError(createError.message);
          return;
        }
        
        settings = newSettings;
      }

      // Atualiza todos os estados de uma vez
      setSession(session);
      setUser(user);
      setIsAuthenticated(true);
      setTenant(tenant);
      setSettings(settings);
      setSubscription(subscription);

    } catch (error: any) {
      console.error('Error initializing workspace:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  const initializeWorkspace = async () => {
    const { session, error } = await supabaseService.auth.getCurrentSession();
    if (session?.user) {
      await initializeWorkspaceWithSession(session);
    } else {
      setSession(null);
      setUser(null);
      setTenant(null);
      setSettings(null);
      setSubscription(null);
      setIsAuthenticated(false);
      setRoles([]);
      setSelectedRole(null);
      setIsOwner(true);
      setLoading(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const {
      data: authListener
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        initializeWorkspaceWithSession(session);
      }
    });
  
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Effect to handle role selection when settings change
  useEffect(() => {
    if (settings?.enable_roles) {
      const savedRoleId = localStorage.getItem(ROLE_STORAGE_KEY);
      if (savedRoleId === null) {
        setSelectedRole(null);
        setIsOwner(true);
      } else {
        const found = roles.find((r) => r.id === savedRoleId);
        if (found) {
          setSelectedRole(found);
          setIsOwner(false);
        } else {
          localStorage.removeItem(ROLE_STORAGE_KEY);
          setSelectedRole(null);
          setIsOwner(true);
        }
      }
    } else {
      // Se roles não estiver habilitado, sempre é owner
      setSelectedRole(null);
      setIsOwner(true);
      localStorage.removeItem(ROLE_STORAGE_KEY);
    }
  }, [settings, roles]);

  const fetchSettings = async () => {
    if (!tenant?.id) {
      setLoading(false);
      return;
    }

    try {
      // Se estiver bloqueado e não for pro/enterprise/trial, retorna sem buscar settings
      if (isBlocked && subscription?.plan !== 'pro' && subscription?.plan !== 'enterprise' && !subscription?.is_trial) {
        setSettings(null);
        setRoles([]);
        setSelectedRole(null);
        setIsOwner(true);
        setLoading(false);
        return;
      }

      const { data: settingsData, error: settingsError } = await settingsService.getTenantSettings(tenant.id);
      if (settingsError) throw settingsError;

      setSettings(settingsData);

      // Só busca roles se a funcionalidade estiver ativada
      if (settingsData?.enable_roles) {
        const { data: rolesData, error: rolesError } = await rolesService.getTenantRoles(tenant.id);
        if (rolesError) throw rolesError;
        setRoles(rolesData || []);
      } else {
        setRoles([]);
      }

      // Verifica role ativa no localStorage
      const savedRoleId = localStorage.getItem(ROLE_STORAGE_KEY);
      if (savedRoleId === null) {
        // Se não há role salva, é owner
        setSelectedRole(null);
        setIsOwner(true);
      } else {
        const found = roles.find((r) => r.id === savedRoleId);
        if (found) {
          setSelectedRole(found);
          setIsOwner(false);
        } else {
          // Se a role salva não existe mais, limpa e define como owner
          localStorage.removeItem(ROLE_STORAGE_KEY);
          setSelectedRole(null);
          setIsOwner(true);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Em caso de erro, limpa os dados e define como owner
      setSettings(null);
      setRoles([]);
      setSelectedRole(null);
      setIsOwner(true);
    } finally {
      setLoading(false);
    }
  };

  const setSelectedRoleById = (id: string | null) => {
    if (id === null) {
      setSelectedRole(null);
      setIsOwner(true);
      localStorage.removeItem(ROLE_STORAGE_KEY);
      return;
    }

    const role = roles.find((r) => r.id === id);
    if (role) {
      setSelectedRole(role);
      setIsOwner(false);
      localStorage.setItem(ROLE_STORAGE_KEY, id);
    }
  };

  const reloadSettings = () => {
    setLoading(true);
    fetchSettings();
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabaseService.auth.signOut();
      if (error) throw error;
  
      localStorage.removeItem(ROLE_STORAGE_KEY); // limpa role salva
  
      setUser(null);
      setSession(null);
      setTenant(null);
      setSettings(null);
      setSubscription(null);
      setIsAuthenticated(false);
      setRoles([]);
      setSelectedRole(null);
      setIsOwner(true);
      setError(null);
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error);
      setError('Erro ao fazer logout. Por favor, tente novamente.');
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };
  

  const updateSettings = async (newSettings: Settings) => {
    try {
      const { data: updatedSettings, error } = await settingsService.upsertSettings(newSettings);
      if (error) throw error;
      
      // Atualiza apenas as settings sem recarregar todo o estado
      setSettings(updatedSettings);
      
      // Se a mudança afetar roles, atualiza o estado de roles
      if (updatedSettings.enable_roles !== settings?.enable_roles) {
        if (updatedSettings.enable_roles) {
          const { data: rolesData, error: rolesError } = await rolesService.getTenantRoles(tenant!.id);
          if (rolesError) throw rolesError;
          setRoles(rolesData || []);
        } else {
          setRoles([]);
          setSelectedRole(null);
          setIsOwner(true);
          localStorage.removeItem(ROLE_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        user,
        session,
        isAuthenticated,
        tenant,
        setTenant,
        settings,
        setSettings,
        updateSettings,
        loading,
        logout,
        error,
        subscription,
        isLoading,
        isTrial,
        isActive,
        isExpired,
        isPaymentFailed,
        isBlocked,
        showWarning,
        tenantError,
        loadingTenant,
        roles,
        selectedRole,
        setSelectedRoleById,
        reloadSettings,
        isOwner,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

const useWorkspaceContext = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace precisa ser usado dentro do WorkspaceProvider");
  }
  return context;
};

export { useWorkspaceContext };
