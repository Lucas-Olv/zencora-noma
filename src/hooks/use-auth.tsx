// src/hooks/useAuth.ts
import { useAuthContext } from "@/contexts/AuthContext";

export const useAuth = () => {
  const { user, logout, isAuthenticated } = useAuthContext();
  return { user, logout, isAuthenticated };
};
