import { useAuthContext } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading } = useAuthContext();
  const { settings, selectedRole } = useSettings();
  const location = useLocation();

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    );

  if (!isAuthenticated) return <Navigate to="/login" />;

  // Check role-based access if roles are enabled
  if (settings?.enable_roles && selectedRole) {
    const path = location.pathname;
    let hasAccess = false;

    // Check access based on path
    switch (true) {
      case path === "/dashboard":
        hasAccess = selectedRole.can_access_dashboard;
        break;
      case path.startsWith("/orders"):
        hasAccess = selectedRole.can_access_orders;
        break;
      case path === "/calendar":
        hasAccess = selectedRole.can_access_calendar;
        break;
      case path === "/production":
        hasAccess = selectedRole.can_access_production;
        break;
      case path === "/reports":
        hasAccess = selectedRole.can_access_reports;
        break;
      case path === "/reminders":
        hasAccess = selectedRole.can_access_reminders;
        break;
      case path === "/settings":
        hasAccess = selectedRole.can_access_settings;
        break;
      default:
        hasAccess = true; // Allow access to unspecified routes
    }

    if (!hasAccess) {
      // Find the first accessible route for this role
      let redirectTo = "/dashboard";
      if (!selectedRole.can_access_dashboard) {
        if (selectedRole.can_access_orders) redirectTo = "/orders";
        else if (selectedRole.can_access_calendar) redirectTo = "/calendar";
        else if (selectedRole.can_access_production) redirectTo = "/production";
        else if (selectedRole.can_access_reports) redirectTo = "/reports";
        else if (selectedRole.can_access_reminders) redirectTo = "/reminders";
        else if (selectedRole.can_access_settings) redirectTo = "/settings";
      }
      return <Navigate to={redirectTo} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
