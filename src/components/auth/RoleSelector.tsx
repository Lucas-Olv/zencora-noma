import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { db } from "@/lib/db";
import { Crown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ThemeToggle from "../layout/ThemeToggle";
import type { Tables } from "@/integrations/supabase/types";

export default function RoleSelector() {
  const navigate = useNavigate();
  const { settings, roles, setSelectedRoleById, setIsOwner } = useWorkspaceContext();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Tables<"roles"> | null>(null);

  useEffect(() => {
    const loadActiveRole = async () => {
      const workspaceData = await db.getWorkspaceData();
      if (workspaceData?.activeRoleId) {
        const role = roles.find((r) => r.id === workspaceData.activeRoleId);
        if (role) {
          handleRoleSelect(role);
        }
      }
    };
    loadActiveRole();
  }, [roles]);

  const handleRoleSelect = async (role: Tables<"roles"> | null) => {
    try {
      setLoading(true);
      setSelectedRoleById(role?.id || null);

      // If owner (role null), go directly to dashboard
      if (!role) {
        setIsOwner(true);
        navigate("/dashboard");
        return;
      }

      // Determine which page to redirect to based on role permissions
      let redirectTo = "/dashboard"; // Default

      if (!role.can_access_dashboard) {
        if (role.can_access_orders) redirectTo = "/orders";
        else if (role.can_access_calendar) redirectTo = "/calendar";
        else if (role.can_access_production) redirectTo = "/production";
        else if (role.can_access_reports) redirectTo = "/reports";
        else if (role.can_access_reminders) redirectTo = "/reminders";
        else if (role.can_access_settings) redirectTo = "/settings";
      }

      navigate(redirectTo);
    } catch (error) {
      console.error("Error selecting role:", error);
    } finally {
      setLoading(false);
    }
  };

  // If roles are not enabled or there are no roles, redirect to dashboard
  useEffect(() => {
    if (!settings?.enable_roles || roles.length === 0) {
      navigate("/dashboard");
    }
  }, [settings, roles, navigate]);

  if (!settings?.enable_roles || roles.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen items-center p-4">
      <div className="flex justify-between items-center w-full">
        <Link
          to="/"
          className="flex items-center text-2xl font-bold zencora-gradient-text"
        >
          <img
            src="/zencora-noma-logo.png"
            alt="Zencora Noma Logo"
            className="h-8 mr-2"
          />
          Zencora Noma
        </Link>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
      <div className="flex items-center justify-center flex-1">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Selecione seu papel</CardTitle>
            <CardDescription>
              Escolha o papel que você deseja utilizar neste dispositivo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Owner Option */}
            <Button
              variant="defaultText"
              className="w-full justify-start text-left h-auto py-4"
              onClick={() => handleRoleSelect(null)}
              disabled={loading}
            >
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                <div>
                  <p className="font-medium">Owner</p>
                  <p className="text-sm">Acesso completo ao sistema</p>
                </div>
              </div>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Outros papéis
                </span>
              </div>
            </div>

            {/* Other Roles */}
            {roles.map((role) => (
              <Button
                key={role.id}
                variant="outline"
                className="w-full justify-start text-left h-auto py-4"
                onClick={() => handleRoleSelect(role)}
                disabled={loading}
              >
                <div>
                  <p className="font-medium">{role.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {[
                      role.can_access_dashboard && "Dashboard",
                      role.can_access_orders && "Encomendas",
                      role.can_access_calendar && "Calendário",
                      role.can_access_production && "Produção",
                      role.can_access_reports && "Relatórios",
                      role.can_access_reminders && "Lembretes",
                      role.can_access_settings && "Configurações",
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 