import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TenantProvider } from "@/contexts/TenantContext";
import { ThemeProvider } from "next-themes";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import NewOrder from "./pages/NewOrder";
import Production from "./pages/Production";
import Reports from "./pages/Reports";
import Calendar from "./pages/Calendar";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import EditOrder from "./pages/EditOrder";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import CollaboratorsLogin from "./pages/CollaboratorsLogin";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuthContext } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/routing/ProtectedRoute";
const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isAuthenticated, isCollaborator, loading, role } = useAuthContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Landing />}
      />
      <Route path="/about" element={<About />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/contact" element={<Contact />} />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
      />
      <Route
        path="/collaborators/:tenantId"
        element={
          isAuthenticated && !isCollaborator ? (
            <Navigate to="/dashboard" />
          ) : (
            <CollaboratorsLogin />
          )
        }
      />
      <Route
        path="/collaborators"
        element={
          isAuthenticated && !isCollaborator ? (
            <Navigate to="/dashboard" />
          ) : (
            <CollaboratorsLogin />
          )
        }
      />

      {/* Protected Owner Routes */}
      {isAuthenticated && !isCollaborator && (
        <Route path="/" element={<Layout />}>
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="orders/new"
            element={
              <ProtectedRoute>
                <NewOrder />
              </ProtectedRoute>
            }
          />
          <Route
            path="orders/edit/:id"
            element={
              <ProtectedRoute>
                <EditOrder />
              </ProtectedRoute>
            }
          />
          <Route
            path="orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="production"
            element={
              <ProtectedRoute>
                <Production />
              </ProtectedRoute>
            }
          />
          <Route
            path="reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="calendar"
            element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
        </Route>
      )}

      {/* Protected Collaborator Routes */}
      {isAuthenticated && isCollaborator && (
        <Route path="/collaborators" element={<Layout />}>
          {role === "order" && (
            <>
              <Route
                path="orders"
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders/:id"
                element={
                  <ProtectedRoute>
                    <OrderDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders/new"
                element={
                  <ProtectedRoute>
                    <NewOrder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders/edit/:id"
                element={
                  <ProtectedRoute>
                    <EditOrder />
                  </ProtectedRoute>
                }
              />
            </>
          )}

          {role === "production" && (
            <>
              <Route
                path="production"
                element={
                  <ProtectedRoute>
                    <Production />
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders/:id"
                element={
                  <ProtectedRoute>
                    <OrderDetail />
                  </ProtectedRoute>
                }
              />
            </>
          )}

          {role === "admin" && (
            <>
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders"
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders/new"
                element={
                  <ProtectedRoute>
                    <NewOrder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders/edit/:id"
                element={
                  <ProtectedRoute>
                    <EditOrder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders/:id"
                element={
                  <ProtectedRoute>
                    <OrderDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="production"
                element={
                  <ProtectedRoute>
                    <Production />
                  </ProtectedRoute>
                }
              />
              <Route
                path="reports"
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="calendar"
                element={
                  <ProtectedRoute>
                    <Calendar />
                  </ProtectedRoute>
                }
              />
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
            </>
          )}
        </Route>
      )}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TenantProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </TenantProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
