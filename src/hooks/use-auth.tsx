// src/hooks/useAuth.ts
import { useAuthContext } from "@/contexts/AuthContext";

export const useAuth = () => {
  const { user, login, logout, isAuthenticated } = useAuthContext();
  return { user, login, logout, isAuthenticated };
};
