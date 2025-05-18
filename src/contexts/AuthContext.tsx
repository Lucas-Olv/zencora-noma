import { createContext, useContext, useEffect, useState } from "react";
import supabase from "@/services/supabaseService";
import { Session, User } from "@supabase/supabase-js";
import { Tables } from "@/integrations/supabase/types";
import { jwtDecode } from "jwt-decode";
type Tenant = Tables<"tenants">;

interface Collaborator {
  id: string;
  tenantId: string;
  role: string;
  isCollaborator: boolean;
  email: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  tenant: Tenant | null;
  setTenant: (tenant: Tenant | null) => void;
  isAuthenticated: boolean;
  isCollaborator: boolean;
  role: "owner" | "admin" | "production" | "order" | null;
  loading: boolean;
  setAsCollaborator: (
    token: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isCollaborator, setIsCollaborator] = useState(false);
  const [role, setRole] = useState<
    "owner" | "admin" | "production" | "order" | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle normal Supabase login (owner)
  useEffect(() => {
    try {
      const loadSession = async () => {
        const { session, error } = await supabase.auth.getCurrentSession();
        if (session) {
          setSession(session);
          setUser(session.user);
          setIsCollaborator(false);
          setRole("owner");
        }
        setLoading(false);
      };
  
      const { data: listener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          if (session) {
            setIsCollaborator(false);
            setRole("owner");
          }
        },
      );
  
      loadSession();
  
      return () => {
        listener.subscription.unsubscribe();
      };
    } catch (error) {
      setError(error.message);
    }
  }, []);

  // Handle collaborator login via JWT (Edge Function)
  const setAsCollaborator = async (
    token: string,
  ) => {
    setLoading(true);
    try {
      const decodedToken: Collaborator = jwtDecode(token);
      const session: Session = {
        access_token: token,
        refresh_token: token,
        user: {
          id: decodedToken.id,
          email: decodedToken.email,
          role: decodedToken.role,
          app_metadata: {},
          user_metadata: {},
          aud: "",
          created_at: "",
        },
        expires_in: 3600,
        token_type: "Bearer",
      };
      const { error } = await supabase.auth.setSession(session);
      if (error) throw error;

      const { user } = await supabase.auth.getCurrentUser();
      setUser(user ?? null);
      console.log(user);
      setSession((await supabase.auth.getCurrentSession()).session ?? null);
      setIsCollaborator(decodedToken.isCollaborator);
      setRole(decodedToken.role as "owner" | "admin" | "production" | "order");
      setTenant(decodedToken.tenantId as any);
    } catch (error) {
      console.error("Erro ao setar colaborador:", error);
      setUser(null);
      setSession(null);
      setIsCollaborator(false);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsCollaborator(false);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        isCollaborator,
        role,
        error,
        loading,
        tenant,
        setTenant,
        setAsCollaborator,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth precisa ser usado dentro do AuthProvider");
  }
  return context;
};
