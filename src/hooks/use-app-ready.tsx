import { useWorkspaceContext } from "@/contexts/WorkspaceContext";

const useAppReady = () => {
  const {
    isAuthenticated,
    loading: authLoading,
    user,
    tenant,
  } = useWorkspaceContext();

  const { loading: workspaceLoading } = useWorkspaceContext();

  const ready =
    isAuthenticated &&
    !authLoading &&
    !workspaceLoading &&
    !!user &&
    !!tenant;

  return {
    ready,
    loading: authLoading || workspaceLoading,
    user,
    tenant,
  };
};

export { useAppReady };
