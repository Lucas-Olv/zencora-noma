import { useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";

export function useAuthenticatedEffect(callback: () => void, deps: any[] = []) {
  const { isAuthenticated, loading } = useAuthContext();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      callback();
    }
  }, [loading, isAuthenticated, ...deps]);
}
