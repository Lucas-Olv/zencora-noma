import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
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
import Delivery from "./pages/Delivery";
import Contact from "./pages/Contact";
import { SubscriptionExpired } from "./pages/SubscriptionExpired";
import { SubscriptionSuccess } from "./pages/SubscriptionSuccess";
import ProtectedRoute from "@/components/routing/ProtectedRoute";
import Reminders from "./pages/Reminders";
import {
  useWorkspaceContext,
  WorkspaceProvider,
} from "@/contexts/WorkspaceContext";
import TermsAcceptance from "./pages/TermsAcceptance";
import { useSessionStorage } from "./storage/session";
import { useTenantStorage } from "./storage/tenant";
import { useSettingsStorage } from "./storage/settings";
import PasswordVerification from "./components/auth/PasswordVerification";
import { AnalyticsProvider } from "./contexts/AnalyticsProviderContext";
const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isLoading } = useWorkspaceContext();
  const { session } = useSessionStorage();
  const { tenant } = useTenantStorage();
  const { settings } = useSettingsStorage();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Se estiver autenticado mas não aceitou os termos, redireciona para a tela de aceitação
  const shouldAcceptTerms =
    session && tenant && tenant.userAcceptedTerms === false;

  return (
    <AnalyticsProvider>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            session ? (
              shouldAcceptTerms ? (
                <Navigate to="/terms-acceptance" />
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
            session ? (
              shouldAcceptTerms ? (
                <Navigate to="/terms-acceptance" />
              ) : (
                <Navigate to="/dashboard" />
              )
            ) : (
              <Login />
            )
          }
        />

        {/* Protected Routes */}
        {session && (
          <>
            <Route path="/" element={<Layout />}>
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    {shouldAcceptTerms ? (
                      <Navigate to="/terms-acceptance" replace />
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
                    {shouldAcceptTerms ? (
                      <Navigate to="/terms-acceptance" replace />
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
                    {shouldAcceptTerms ? (
                      <Navigate to="/terms-acceptance" replace />
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
                    {shouldAcceptTerms ? (
                      <Navigate to="/terms-acceptance" replace />
                    ) : (
                      <Production />
                    )}
                  </ProtectedRoute>
                }
              />
              <Route
                path="delivery"
                element={
                  <ProtectedRoute>
                    {shouldAcceptTerms ? (
                      <Navigate to="/terms-acceptance" replace />
                    ) : (
                      <Delivery />
                    )}
                  </ProtectedRoute>
                }
              />
              <Route
                path="reports"
                element={
                  <ProtectedRoute>
                    {shouldAcceptTerms ? (
                      <Navigate to="/terms-acceptance" replace />
                    ) : settings?.lockReportsByPassword &&
                      !location.state?.verified ? (
                      <Navigate
                        to="/verify-password"
                        state={{
                          redirect: "/reports",
                          name: "os relatórios",
                          fromRoleSwitch: false,
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
                    {shouldAcceptTerms ? (
                      <Navigate to="/terms-acceptance" replace />
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
                    {shouldAcceptTerms ? (
                      <Navigate to="/terms-acceptance" replace />
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
                    {shouldAcceptTerms ? (
                      <Navigate to="/terms-acceptance" replace />
                    ) : settings?.lockSettingsByPassword &&
                      !location.state?.verified ? (
                      <Navigate
                        to="/verify-password"
                        state={{
                          redirect: "/settings",
                          name: "as configurações",
                          fromRoleSwitch: false,
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
              <Route
                path="verify-password"
                element={
                  <ProtectedRoute>
                    <PasswordVerification />
                  </ProtectedRoute>
                }
              />
              <Route
                path="success"
                element={
                  <ProtectedRoute>
                    {shouldAcceptTerms ? (
                      <Navigate to="/terms-acceptance" replace />
                    ) : (
                      <SubscriptionSuccess />
                    )}
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route
              path="/terms-acceptance"
              element={
                <ProtectedRoute>
                  <TermsAcceptance />
                </ProtectedRoute>
              }
            />
          </>
        )}

        {!session && (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnalyticsProvider>
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
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </WorkspaceProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
