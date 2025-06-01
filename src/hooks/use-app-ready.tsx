import { useWorkspaceContext } from "@/contexts/WorkspaceContext";

const useAppReady = () => {
  const {
    isAuthenticated,
    user,
    tenant,
  } = useWorkspaceContext();

  const { isLoading: workspaceLoading } = useWorkspaceContext();

  const ready =
    isAuthenticated &&
    !workspaceLoading &&
    !!user &&
    !!tenant;

  return {
    ready,
    loading: workspaceLoading,
    user,
    tenant,
  };
};

export { useAppReady };
