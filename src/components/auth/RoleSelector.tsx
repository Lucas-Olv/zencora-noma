import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { db } from "@/lib/db";
import { Crown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ThemeToggle from "../layout/ThemeToggle";
import type { Tables } from "@/integrations/supabase/types";
import { appSessionsService } from "@/services/supabaseService";
import { useToast } from "@/components/ui/use-toast";

export default function RoleSelector() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    settings, 
    roles, 
    session, 
    tenant, 
    setAppSession, 
    appSession: currentAppSession,
    setSelectedRole 
  } = useWorkspaceContext();
  const [loading, setLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleRoleSelect = async (role: Tables<"roles"> | null) => {
    try {
      if (!session?.access_token || !tenant?.id) {
        toast({
          title: "Erro ao selecionar papel",
          description: "Sessão inválida. Por favor, faça login novamente.",
          variant: "destructive",
        });
        return;
      }

      if (loading || isNavigating) return;

      setLoading(true);
      setIsNavigating(true);

      const selectedRoleId = role?.id;
      const selectedRoleName = role ? role.name : 'owner';

      // Atualiza o selectedRole no contexto e IndexedDB
      await db.updateSelectedRoleData(role);
      setSelectedRole(role);

      // Se já existe uma sessão para este role, apenas atualiza
      if ((role === null && currentAppSession?.role === 'owner') || 
          (role && currentAppSession?.role_id === role.id)) {
        // Busca a sessão atualizada do Supabase para garantir dados completos
        const { data: updatedAppSession, error: updateError } = await appSessionsService.updateAppSession(
          currentAppSession.id,
          {
            last_used_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
          }
        );

        if (updateError) throw updateError;

        if (updatedAppSession) {
          // Atualiza no IndexedDB com os dados completos da sessão
          await db.updateAppSessionData(updatedAppSession);

          // Atualiza no contexto
          setAppSession(updatedAppSession);
        } else {
          throw new Error("Falha ao atualizar sessão");
        }

        // Redireciona para o dashboard
        navigate("/dashboard", { replace: true });
        return;
      }

      // Se não existe sessão para este role, cria uma nova
      const { data: newAppSession, error: appSessionError } = await appSessionsService.createAppSession({
        tenant_id: tenant.id,
        role: selectedRoleName,
        role_id: selectedRoleId,
        last_used_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      });

      if (appSessionError) throw appSessionError;

      // Garante que o IndexedDB receba o appSession completo do Supabase
      if (newAppSession) {
        // Update IndexedDB with complete app session data
        await db.updateAppSessionData(newAppSession);

        // Update context with complete app session data
        setAppSession(newAppSession);
      } else {
        throw new Error("Falha ao criar nova sessão");
      }

      // Determine which page to redirect to based on role permissions
      let redirectTo = "/dashboard"; // Default

      if (role && !role.can_access_dashboard) {
        if (role.can_access_orders) redirectTo = "/orders";
        else if (role.can_access_calendar) redirectTo = "/calendar";
        else if (role.can_access_production) redirectTo = "/production";
        else if (role.can_access_reports) redirectTo = "/reports";
        else if (role.can_access_reminders) redirectTo = "/reminders";
        else if (role.can_access_settings) redirectTo = "/settings";
      }

      // Use replace to prevent going back to role selection
      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error("Error selecting role:", error);
      toast({
        title: "Erro ao selecionar papel",
        description: "Não foi possível selecionar o papel. Tente novamente.",
        variant: "destructive",
      });
      setIsNavigating(false);
    } finally {
      setLoading(false);
    }
  };

  // If roles are not enabled or there are no roles, redirect to dashboard
  useEffect(() => {
    if (!settings?.enable_roles || roles.length === 0) {
      navigate("/dashboard", { replace: true });
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
              disabled={loading || isNavigating}
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
                disabled={loading || isNavigating}
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