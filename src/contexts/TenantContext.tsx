import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { Tables } from '@/integrations/supabase/types';
import { useAuthContext } from '@/contexts/AuthContext';

type Tenant = Tables<'tenants'>;

interface TenantContextType {
  tenant: Tenant | null;
  loading: boolean;
  error: string | null;
  refreshTenant: () => Promise<void>;
  setTenant: (tenant: Tenant | null, skipFetch?: boolean) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenantState] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isCollaborator } = useAuthContext();

  const fetchTenant = async () => {
    try {
      setLoading(true);
      setError(null);

      const { user, error: authError } = await supabaseService.auth.getCurrentUser();
      if (authError || !user) throw new Error('Usuário não autenticado');

      const { data: tenantData, error: tenantError } = await supabaseService.tenants.getUserTenant(user.id);
      if (tenantError || !tenantData) throw new Error('Tenant não encontrado');

      setTenantState(tenantData);
    } catch (error: any) {
      setError(error.message);
      setTenantState(null);
    } finally {
      setLoading(false);
    }
  };

  const setTenant = (tenant: Tenant | null, skipFetch = false) => {
    setTenantState(tenant);
    if (!skipFetch) fetchTenant(); // revalida se não for colaborador
  };

  useEffect(() => {
    // Se for colaborador, o tenant vai ser setado manualmente no início do app
    if (!isCollaborator) {
      fetchTenant();
    } else {
      setLoading(false); // evita ficar preso no loading
    }
  }, [isCollaborator]);

  const value = {
    tenant,
    loading,
    error,
    refreshTenant: fetchTenant,
    setTenant,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
