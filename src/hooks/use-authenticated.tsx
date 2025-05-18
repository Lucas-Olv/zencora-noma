import { useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";

export function useAuthenticatedEffect(callback: () => void, deps: any[] = []) {
  const { isAuthenticated, loading } = useAuthContext();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      callback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, isAuthenticated, ...deps]);
}
