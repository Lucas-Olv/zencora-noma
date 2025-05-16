import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { Tables } from '@/integrations/supabase/types';

type Tenant = Tables<'tenants'>;

interface TenantContextType {
  tenant: Tenant | null;
  loading: boolean;
  error: string | null;
  refreshTenant: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTenant = async () => {
    try {
      setLoading(true);
      setError(null);

      const { user, error: authError } = await supabaseService.auth.getCurrentUser();
      
      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }

      const { data: tenantData, error: tenantError } = await supabaseService.tenants.getUserTenant(user.id);
      
      if (tenantError || !tenantData) {
        throw new Error('Tenant não encontrado');
      }

      setTenant(tenantData);
    } catch (error: any) {
      setError(error.message);
      setTenant(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenant();
  }, []);

  const value = {
    tenant,
    loading,
    error,
    refreshTenant: fetchTenant
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