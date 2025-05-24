// contexts/SettingsContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { rolesService, settingsService } from '@/services/supabaseService';

type Role = {
  id: string;
  tenant_id: string;
  name: string;
  accessible_panels: string[];
  created_at: string;
};

type Settings = {
  id: string;
  tenant_id: string;
  enable_roles: boolean;
  lock_reports_with_password: boolean;
};

type SettingsContextType = {
  settings: Settings | null;
  roles: Role[];
  selectedRole: Role | null;
  loading: boolean;
  setSelectedRoleById: (id: string | null) => void;
  reloadSettings: () => void;
};

const SettingsContext = createContext<SettingsContextType>({
  settings: null,
  roles: [],
  selectedRole: null,
  loading: true,
  setSelectedRoleById: () => {},
  reloadSettings: () => {},
});

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { tenant } = useAuthContext();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  const ROLE_STORAGE_KEY = 'active_role_id';

  const fetchSettings = async () => {
    if (!tenant?.id) return;

    const { data: settingsData } = await settingsService.getTenantSettings(tenant.id);

    const { data: rolesData } = await rolesService.getTenantRoles(tenant.id);

    setSettings(settingsData);
    setRoles(rolesData || []);

    // Verifica role ativa no localStorage
    const savedRoleId = localStorage.getItem(ROLE_STORAGE_KEY);
    if (savedRoleId) {
      const found = rolesData?.find((r) => r.id === savedRoleId);
      if (found) setSelectedRole(found);
    }

    setLoading(false);
  };

  const setSelectedRoleById = (id: string | null) => {
    if (id === null) {
      setSelectedRole(null);
      localStorage.removeItem(ROLE_STORAGE_KEY);
      return;
    }

    const role = roles.find((r) => r.id === id);
    if (role) {
      setSelectedRole(role);
      localStorage.setItem(ROLE_STORAGE_KEY, id);
    }
  };

  const reloadSettings = () => {
    setLoading(true);
    fetchSettings();
  };

  useEffect(() => {
    fetchSettings();
  }, [tenant?.id]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        roles,
        selectedRole,
        loading,
        setSelectedRoleById,
        reloadSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
