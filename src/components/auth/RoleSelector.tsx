import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/SettingsContext";
import { useToast } from "@/components/ui/use-toast";
import { RoleType } from "@/services/supabaseService";
import { Crown } from "lucide-react";

export default function RoleSelector() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings, roles, setSelectedRoleById } = useSettings();
  const [loading, setLoading] = useState(false);

  // Check if there's a saved role in localStorage
  useEffect(() => {
    const savedRoleId = localStorage.getItem("active_role_id");
    if (savedRoleId) {
      const role = roles.find((r) => r.id === savedRoleId);
      if (role) {
        handleRoleSelect(role);
      }
    }
  }, [roles]);

  const handleRoleSelect = async (role: RoleType | null) => {
    try {
      setLoading(true);
      setSelectedRoleById(role?.id || null);

      // Se for owner (role null), vai direto para o dashboard
      if (!role) {
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
      toast({
        title: "Erro ao selecionar papel",
        description: "Não foi possível selecionar o papel. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // If roles are not enabled or there are no roles, redirect to dashboard
  useEffect(() => {
    if (!settings?.enable_roles || roles.length === 0) {
      navigate("/dashboard");
    }
  }, [settings, roles]);

  if (!settings?.enable_roles || roles.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
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
            variant="default"
            className="w-full justify-start text-left h-auto py-4 bg-primary hover:bg-primary/90"
            onClick={() => handleRoleSelect(null)}
            disabled={loading}
          >
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              <div>
                <p className="font-medium">Owner</p>
                <p className="text-sm text-muted-foreground">
                  Acesso completo ao sistema
                </p>
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
  );
} 