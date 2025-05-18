import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { Tables } from '@/integrations/supabase/types';
import { useAuthContext } from './AuthContext';
type Tenant = Tables<'tenants'>;

interface TenantContextType {
  tenant: Tenant | null;
  loading: boolean;
  error: string | null;
  refreshTenant: () => Promise<void>;
  setTenant: (tenant: Tenant | null) => void;
  tenantError: string | null;
  loadingTenant: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenantState] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isCollaborator } = useAuthContext(); // usa o user do contexto
  const { setTenant: setTenantAuth } = useAuthContext();
  const [tenantError, setTenantError] = useState<string | null>(null);
  const [loadingTenant, setLoadingTenant] = useState(true);

  const fetchTenant = async () => {
    try {
      setLoading(true);
      setError(null);
      setLoadingTenant(true);

      if (!user) throw new Error("Usuário não autenticado");

      const { data: tenantData, error: tenantError } =
        await supabaseService.tenants.getUserTenant(user.id);
      if (tenantError || !tenantData) throw new Error("Tenant não encontrado");

      setTenantState(tenantData);
      setTenantAuth(tenantData);
    } catch (error: any) {
      setError(error.message);
      setTenantState(null);
      setTenantError(error.message);
    } finally {
      setLoading(false);
      setLoadingTenant(false);
    }
  };

  const setTenant = (tenant: Tenant | null, skipFetch = false) => {
    setTenantState(tenant);
    if (!skipFetch) fetchTenant();
  };

  useEffect(() => {
    if (!isCollaborator && user) {
      fetchTenant();
    } else if (isCollaborator) {
      setLoading(false);
    }
  }, [isCollaborator, user]); // 🔥 importante observar user

  return (
    <TenantContext.Provider
      value={{
        tenant,
        loading,
        error,
        refreshTenant: fetchTenant,
        setTenant,
        tenantError,
        loadingTenant,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}
