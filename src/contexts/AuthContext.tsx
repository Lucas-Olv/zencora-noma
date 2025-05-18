import { createContext, useContext, useEffect, useState, useRef } from "react";
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
  iss: string;
  sub: string;
  exp: number;
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
  setAsCollaborator: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isCollaborator, setIsCollaborator] = useState(false);
  const [role, setRole] = useState<"owner" | "admin" | "production" | "order" | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isCollaboratorRef = useRef(isCollaborator);

  useEffect(() => {
    isCollaboratorRef.current = isCollaborator;
  }, [isCollaborator]);

  useEffect(() => {
    const collaboratorToken = sessionStorage.getItem("collaboratorToken");

    if (collaboratorToken) {
      setAsCollaborator(collaboratorToken);
    } else {
      const loadSession = async () => {
        const { session, error } = await supabase.auth.getCurrentSession();
        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }

        if (session) {
          setSession(session);
          setUser(session.user);
          setRole("owner");
          setIsCollaborator(false);
          setIsAuthenticated(true);
        }
        setLoading(false);
      };

      const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
        // Evita sobrescrever se estiver autenticado como colaborador
        if (isCollaboratorRef.current) return;

        setSession(session);
        setUser(session?.user ?? null);
        setIsCollaborator(false);
        setRole(session ? "owner" : null);
        setIsAuthenticated(!!session?.user);
      });

      loadSession();

      return () => {
        listener.subscription.unsubscribe();
      };
    }
  }, []);

  const setAsCollaborator = async (token: string) => {
    try {
      setLoading(true);
      const decoded: Collaborator = jwtDecode(token);
      sessionStorage.setItem("collaboratorToken", token);

      setIsCollaborator(true);
      setRole(decoded.role as any);
      setTenant({ id: decoded.tenantId } as any);
      setUser(null); // colaborador não é user do Supabase
      setSession(null);
      setIsAuthenticated(true);
    } catch (err) {
      console.error("Erro ao setar colaborador:", err);
      setError("Token inválido ou expirado");
      setIsCollaborator(false);
      setRole(null);
      setTenant(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    sessionStorage.removeItem("collaboratorToken");
    await supabase.auth.signOut();

    setUser(null);
    setSession(null);
    setIsCollaborator(false);
    setRole(null);
    setTenant(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated,
        isCollaborator,
        role,
        tenant,
        setTenant,
        loading,
        setAsCollaborator,
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
