// context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

type AuthUser = {
  id: string;
  tenantId?: string;
  role?: string;
  isCollaborator: boolean;
};

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isCollaborator: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isProduction: boolean;
  isOrder: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    if (storedToken) {
      decodeToken(storedToken);
    }
  }, []);

  const decodeToken = (jwt: string) => {
    try {
      const decoded: any = jwtDecode(jwt);

      const userData: AuthUser = {
        id: decoded.sub,
        tenantId: decoded.tenantId,
        role: decoded.role,
        isCollaborator: decoded.isCollaborator || false,
      };

      setToken(jwt);
      setUser(userData);
      localStorage.setItem("auth_token", jwt);
    } catch (error) {
      console.error("Invalid token", error);
      logout();
    }
  };

  const login = (jwt: string) => {
    decodeToken(jwt);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth_token");
  };

  const isAuthenticated = !!token;
  const isCollaborator = user?.isCollaborator || false;
  const isOwner = isAuthenticated && !isCollaborator;
  const isAdmin = isCollaborator && user?.role === "admin";
const isProduction = isCollaborator && user?.role === "production";
const isOrder = isCollaborator && user?.role === "order";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated,
        isCollaborator,
        isOwner,
        isAdmin,
        isProduction,
        isOrder,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
