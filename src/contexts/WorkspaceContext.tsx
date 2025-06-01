import { createContext, useContext, useEffect, useRef, useState } from "react";
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
  updateRoles: (newRoles: RoleType[]) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
  const workspaceStartedSync = useRef(false);

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
    const workspaceHasInitialized = localStorage.getItem('workspace_initialized');
    if (workspaceHasInitialized === 'true') return;
    initializeWorkspace();
  }, []);

  const initializeWorkspaceWithSession = async (session: Session) => {
    try {
      if (workspaceStartedSync.current) return;
      setIsLoading(true);
      workspaceStartedSync.current = true;
      console.log('initializeWorkspaceWithSession called', { session, initialized: workspaceStartedSync.current });

      try {
        await supabaseService.auth.initializeWorkspaceIfNeeded(session.user);
        localStorage.setItem('workspace_initialized', 'true');
      } catch (err) {
        console.error('Erro ao inicializar workspace:', err);
        return;
      }
      
      const user = session.user;

      // Apenas busca o usuário, sem tentar criar
      const { data: userData, error: userError } = 
        await supabaseService.users.getUserById(user.id);

      if (userError) {
        setError(userError.message);
        return;
      }

      if (!userData) {
        setError("Usuário não encontrado");
        return;
      }

      // Fetch subscription
      const { data: subscriptionData, error: subscriptionError } = 
        await supabaseService.subscriptions.getUserSubscription(user.id);

      if (subscriptionError) {
        setError(subscriptionError.message);
        return;
      }

      if (!subscriptionData) {
        setError("Assinatura não encontrada");
        return;
      }

      // Fetch tenant
      const { data: tenantData, error: tenantError } = 
        await supabaseService.tenants.getUserTenant(user.id);

      if (tenantError) {
        setError(tenantError.message);
        return;
      }

      if (!tenantData) {
        setError("Tenant não encontrado");
        return;
      }

      // Fetch settings
      const { data: settingsData, error: settingsError } = 
        await settingsService.getTenantSettings(tenantData.id);

      if (settingsError) {
        setError(settingsError.message);
        return;
      }

      if (!settingsData) {
        setError("Configurações não encontradas");
        return;
      }

      // Fetch roles if enabled
      let roles: RoleType[] = [];
      let selectedRole: RoleType | null = null;
      let isOwner = false; // Por padrão, não é owner

      if (settingsData.enable_roles) {
        const { data: rolesData, error: rolesError } = await rolesService.getTenantRoles(tenantData.id);
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
        }
        }
      } else {
        // Se roles não estiver habilitado, é owner
        isOwner = true;
        localStorage.removeItem(ROLE_STORAGE_KEY);
      }

      // Atualiza todos os estados de uma vez
      setSession(session);
      setUser(user);
      setIsAuthenticated(true);
      setTenant(tenantData);
      setSettings(settingsData);
      setSubscription(subscriptionData);
      setRoles(roles);
      setSelectedRole(selectedRole);
      setIsOwner(isOwner);

    } catch (error: any) {
      console.error('Error initializing workspace:', error);
      setError(error.message);
      // Em caso de erro, limpa todos os estados relacionados a role
      setSelectedRole(null);
      setIsOwner(true);
      localStorage.removeItem(ROLE_STORAGE_KEY);
    } finally {
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
      setSelectedRole(null);
      setIsOwner(true);
      setIsLoading(false);
      workspaceStartedSync.current = false;
    }
  };

  useEffect(() => {
    const {
      data: authListener
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        initializeWorkspaceWithSession(session);
      } else {
        localStorage.removeItem('workspace_initialized')
        setSession(null);
        setUser(null);
        setTenant(null);
        setSettings(null);
        setSubscription(null);
        setIsAuthenticated(false);
        setSelectedRole(null);
        setIsOwner(true);
        setIsLoading(false);
        workspaceStartedSync.current = false;
      }
    });
  
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Effect to handle role selection when settings change
  useEffect(() => {
    if (!settings || !settings.enable_roles) {
      setSelectedRole(null);
      setIsOwner(true);
      localStorage.removeItem(ROLE_STORAGE_KEY);
      return;
    }

      const savedRoleId = localStorage.getItem(ROLE_STORAGE_KEY);
    
    // Se tem roles disponíveis e não tem role salva, não é owner
    if (roles.length > 0 && !savedRoleId) {
      setSelectedRole(null);
      setIsOwner(false);
      return;
    }

    // Se não tem roles disponíveis, é owner
    if (roles.length === 0) {
        setSelectedRole(null);
        setIsOwner(true);
      localStorage.removeItem(ROLE_STORAGE_KEY);
      return;
    }

    // Se tem role salva, verifica se ela existe
    if (savedRoleId) {
        const found = roles.find((r) => r.id === savedRoleId);
        if (found) {
          setSelectedRole(found);
          setIsOwner(false);
        } else {
          localStorage.removeItem(ROLE_STORAGE_KEY);
          setSelectedRole(null);
        setIsOwner(false); // Se tinha role salva mas não existe mais, ainda não é owner
      }
    }
  }, [settings?.enable_roles, roles]);

  const fetchSettings = async () => {
    if (!tenant?.id) {
      setIsLoading(false);
      return;
    }

    try {
      // Se estiver bloqueado e não for pro/enterprise/trial, retorna sem buscar settings
      if (isBlocked && subscription?.plan !== 'pro' && subscription?.plan !== 'enterprise' && !subscription?.is_trial) {
        setSettings(null);
        setRoles([]);
        setSelectedRole(null);
        setIsOwner(true);
        setIsLoading(false);
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
      setIsLoading(false);
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
    fetchSettings();
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

  const updateRoles = async (newRoles: RoleType[]) => {
    try {
      // Atualiza apenas os roles sem recarregar todo o estado
      setRoles(newRoles);
      
      // Se a role selecionada foi removida, limpa a seleção
      if (selectedRole && !newRoles.find(r => r.id === selectedRole.id)) {
        setSelectedRole(null);
        setIsOwner(true);
        localStorage.removeItem(ROLE_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error updating roles:', error);
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
        updateRoles,
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
