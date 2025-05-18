// useAuthenticatedEffect.ts
import { useEffect } from "react";
import { useAppReady } from "@/hooks/use-app-ready";

export function useAuthenticatedEffect(callback: () => void, deps: any[] = []) {
  const { ready } = useAppReady();

  useEffect(() => {
    if (ready) {
      callback();
    }
  }, [ready, ...deps]);
}
