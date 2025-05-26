import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Production from "./pages/Production";
import Reports from "./pages/Reports";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import { SubscriptionExpired } from "./pages/SubscriptionExpired";
import ProtectedRoute from "@/components/routing/ProtectedRoute";
import { SubscriptionGate } from "./components/subscription/SubscriptionGate";
import Reminders from "./pages/Reminders"
import RoleSelector from "@/components/auth/RoleSelector";
import PasswordVerification from "@/components/auth/PasswordVerification";
import { useWorkspaceContext, WorkspaceProvider } from "@/contexts/WorkspaceContext";
const queryClient = new QueryClient();

const BLOCKED_ROUTES = ["/dashboard", "/production", "/reports", "/calendar", "/settings", "/profile", "/reminders"];

const AppRoutes = () => {
  const { isAuthenticated, loading, settings, roles, selectedRole, isOwner } = useWorkspaceContext();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Se estiver autenticado, tem roles habilitados e roles disponíveis, mas não tem role selecionada E não é owner
  const shouldSelectRole = isAuthenticated && settings?.enable_roles && roles.length > 0 && !selectedRole && !isOwner;

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            shouldSelectRole ? (
              <Navigate to="/select-role" />
            ) : (
              <Navigate to="/dashboard" />
            )
          ) : (
            <Landing />
          )
        }
      />
      <Route path="/about" element={<About />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/contact" element={<Contact />} />
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            shouldSelectRole ? (
              <Navigate to="/select-role" />
            ) : (
              <Navigate to="/dashboard" />
            )
          ) : (
            <Login />
          )
        }
      />

      {/* Protected Routes */}
      {isAuthenticated ? (
        <Route path="/" element={<Layout />}>
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                {shouldSelectRole ? (
                  <Navigate to="/select-role" replace />
                ) : (
                  <Dashboard />
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path="orders"
            element={
              <ProtectedRoute>
                {shouldSelectRole ? (
                  <Navigate to="/select-role" replace />
                ) : (
                  <Orders />
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path="orders/:id"
            element={
              <ProtectedRoute>
                {shouldSelectRole ? (
                  <Navigate to="/select-role" replace />
                ) : (
                  <OrderDetail />
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path="production"
            element={
              <ProtectedRoute>
                {shouldSelectRole ? (
                  <Navigate to="/select-role" replace />
                ) : (
                  <Production />
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path="verify-password"
            element={
              <ProtectedRoute>
                {shouldSelectRole ? (
                  <Navigate to="/select-role" replace />
                ) : (
                  <PasswordVerification />
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path="reports"
            element={
              <ProtectedRoute>
                {shouldSelectRole ? (
                  <Navigate to="/select-role" replace />
                ) : settings?.lock_reports_by_password && !location.state?.verified ? (
                  <Navigate
                    to="/verify-password"
                    state={{
                      redirect: "/reports",
                      name: "os relatórios",
                      fromRoleSwitch: false
                    }}
                    replace
                  />
                ) : (
                  <Reports />
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path="calendar"
            element={
              <ProtectedRoute>
                {shouldSelectRole ? (
                  <Navigate to="/select-role" replace />
                ) : (
                  <Calendar />
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path="reminders"
            element={
              <ProtectedRoute>
                {shouldSelectRole ? (
                  <Navigate to="/select-role" replace />
                ) : (
                  <Reminders />
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute>
                {shouldSelectRole ? (
                  <Navigate to="/select-role" replace />
                ) : settings?.lock_settings_by_password && !location.state?.verified ? (
                  <Navigate
                    to="/verify-password"
                    state={{
                      redirect: "/settings",
                      name: "as configurações",
                      fromRoleSwitch: false
                    }}
                    replace
                  />
                ) : (
                  <Settings />
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path="subscription-expired"
            element={
              <ProtectedRoute>
                <SubscriptionExpired />
              </ProtectedRoute>
            }
          />
        </Route>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}

      {/* Protected Routes Outside Layout scheme*/}
      {isAuthenticated && settings?.enable_roles && roles.length > 0 && (
        <Route
          path="/select-role"
          element={<RoleSelector />}
        />
      )}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <WorkspaceProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SubscriptionGate
              blockedRoutes={BLOCKED_ROUTES}
              redirectTo="/subscription-expired"
            >
              <AppRoutes />
            </SubscriptionGate>
          </BrowserRouter>
        </TooltipProvider>
      </WorkspaceProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
