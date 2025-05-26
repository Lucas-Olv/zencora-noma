import { createContext, useContext, useEffect, useState } from "react";
import { supabaseService } from "@/services/supabaseService";
import { Session, User } from "@supabase/supabase-js";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "./SettingsContext";

type Tenant = Tables<"tenants">;
type Settings = Tables<"settings">;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  tenant: Tenant | null;
  setTenant: (tenant: Tenant | null) => void;
  settings: Settings | null;
  setSettings: (settings: Settings | null) => void;
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSettingUp, setIsSettingUp] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      if (!mounted) return;
      
      try {
        setLoading(true);
        const { session, error } = await supabaseService.auth.getCurrentSession();
        if (error) {
          if (mounted) {
            setError(error.message);
            setLoading(false);
          }
          return;
        }

        if (session?.user) {
          const { success, data: workspaceData } = await supabaseService.auth.setupUserWorkspace(session.user);
          if (success && workspaceData && mounted) {
            setSession(session);
            setUser(session.user);
            setTenant(workspaceData.tenant);
            setSettings(workspaceData.settings);
            setIsAuthenticated(true);
          } else if (mounted) {
            await supabaseService.auth.signOut();
            setError('Falha ao configurar workspace');
          }
        }
      } catch (error: any) {
        console.error('Erro ao carregar sessão:', error);
        if (mounted) {
          setError('Erro ao carregar sessão');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const { data: listener } = supabaseService.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (isSettingUp) return;

      if (event === 'SIGNED_IN') {
        setIsSettingUp(true);
        try {
          if (session?.user) {
            const { success, data: workspaceData } = await supabaseService.auth.setupUserWorkspace(session.user);
            if (success && workspaceData && mounted) {
              setSession(session);
              setUser(session.user);
              setTenant(workspaceData.tenant);
              setSettings(workspaceData.settings);
              setIsAuthenticated(true);
            } else if (mounted) {
              await supabaseService.auth.signOut();
              setError('Falha ao configurar workspace');
            }
          }
        } catch (error: any) {
          console.error('Erro no setup do workspace:', error);
          if (mounted) {
            await supabaseService.auth.signOut();
            setError('Falha ao configurar workspace');
          }
        } finally {
          if (mounted) {
            setIsSettingUp(false);
          }
        }
      } else if (event === 'SIGNED_OUT' && mounted) {
        setSession(null);
        setUser(null);
        setTenant(null);
        setIsAuthenticated(false);
        setSettings(null);
        setError(null);
      }
    });

    loadSession();

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [isSettingUp]);

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabaseService.auth.signOut();
      if (error) throw error;

      setUser(null);
      setSession(null);
      setTenant(null);
      setSettings(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error);
      setError('Erro ao fazer logout. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated,
        tenant,
        setTenant,
        settings,
        setSettings,
        loading,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth precisa ser usado dentro do AuthProvider");
  }
  return context;
};

export { useAuthContext };
