// contexts/SettingsContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { rolesService, settingsService, RoleType } from '@/services/supabaseService';
import { Tables } from '@/integrations/supabase/types';

type Settings = Tables<"settings">;

type SettingsContextType = {
  settings: Settings | null;
  roles: RoleType[];
  selectedRole: RoleType | null;
  loading: boolean;
  setSelectedRoleById: (id: string | null) => void;
  reloadSettings: () => void;
  isOwner: boolean;
};

const SettingsContext = createContext<SettingsContextType>({
  settings: null,
  roles: [],
  selectedRole: null,
  loading: true,
  setSelectedRoleById: () => {},
  reloadSettings: () => {},
  isOwner: false,
});

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { tenant } = useAuthContext();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [roles, setRoles] = useState<RoleType[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const { subscription, isBlocked } = useSubscription();

  const ROLE_STORAGE_KEY = 'active_role_id';

  const fetchSettings = async () => {
    if (!tenant?.id) return;

    if (isBlocked || !subscription && (subscription?.plan !== 'pro' && subscription?.plan !== 'enterprise' && !subscription?.is_trial)) {
      return;
    }

    try {
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
      // Em caso de erro, mantém o estado anterior
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

  useEffect(() => {
    fetchSettings();
  }, [tenant]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        roles,
        selectedRole,
        loading,
        setSelectedRoleById,
        reloadSettings,
        isOwner,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
