import { useAuthContext } from "@/contexts/AuthContext";

const useAppReady = () => {
  const {
    isAuthenticated,
    loading,
    user,
    tenant,
    isCollaborator,
  } = useAuthContext();

  const ready =
    isAuthenticated &&
    !loading &&
    !!user &&
    (isCollaborator || !!tenant); // se não for colaborador, precisa de tenant

  return {
    ready,
    loading,
    user,
    tenant,
    isCollaborator,
  };
};

export { useAppReady };
