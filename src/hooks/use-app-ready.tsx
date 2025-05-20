import { useAuthContext } from "@/contexts/AuthContext";

const useAppReady = () => {
  const {
    isAuthenticated,
    loading,
    user,
    tenant,
  } = useAuthContext();

  const ready =
    isAuthenticated &&
    !loading &&
    !!user &&
    !!tenant;

  return {
    ready,
    loading,
    user,
    tenant,
  };
};

export { useAppReady };
