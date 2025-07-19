import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { ReactNode, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useSessionStorage } from "@/storage/session";
import { useSubscriptionStorage } from "@/storage/subscription";
import dayjs from "dayjs";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const { session } = useSessionStorage();
  const { isLoading } = useWorkspaceContext();
  const { subscription } = useSubscriptionStorage();
  const navigate = useNavigate();

    const isActive =
      subscription?.status === "active" &&
      dayjs(subscription?.expiresAt).isAfter(dayjs()) &&
      dayjs(subscription?.gracePeriodUntil).isAfter(dayjs());

  useEffect(() => {
    if (location.pathname === "/login" && session && isActive) {
      navigate("/", { replace: true });
    } else {
      navigate("/subscription-expired", { replace: true });
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
