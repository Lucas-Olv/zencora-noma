import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { ReactNode, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useSessionStore } from "@/storage/session";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const { session } = useSessionStore();
  const { isLoading } = useWorkspaceContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === "/login" && session) {
      navigate("/", { replace: true });
    }
  }, [location.pathname, session]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    );

  if (!session) return <Navigate to="/login" />;

  return <>{children}</>;
};

export default ProtectedRoute;
