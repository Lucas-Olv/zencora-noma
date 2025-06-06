import {
  Calendar,
  ClipboardList,
  Home,
  User,
  Users,
  LogOut,
  Settings,
  FileText,
  Lock,
  NotepadTextDashedIcon,
  NotepadText,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabaseService } from "@/services/supabaseService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  SubscriptionGate,
  useSubscriptionRoutes,
} from "@/components/subscription/SubscriptionGate";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SettingsGate } from "@/components/settings/SettingsGate";
import { Loader2 } from "lucide-react";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { db } from "@/lib/db";
import { supabase } from "@/integrations/supabase/client";

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Encomendas",
    href: "/orders",
    icon: ClipboardList,
  },
  {
    title: "Produção",
    href: "/production",
    icon: Users,
  },
  {
    title: "Relatórios",
    href: "/reports",
    icon: FileText,
  },
  {
    title: "Lembretes",
    href: "/reminders",
    icon: NotepadText,
  },
  {
    title: "Calendário",
    href: "/calendar",
    icon: Calendar,
  },
];

const bottomNavItems: NavItem[] = [
  {
    title: "Configurações",
    href: "/settings",
    icon: Settings,
  },
];

interface NavButtonProps {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}

const NavButton = ({ item, isActive, onClick }: NavButtonProps) => {
  const { blockedRoutes, allowedRoutes } = useSubscriptionRoutes();
  const {
    settings,
    isBlocked,
    isTrial,
    isActive: subscriptionActive,
    subscription,
  } = useWorkspaceContext();
  const isRouteBlocked = blockedRoutes.includes(item.href);
  const isRouteAllowed = allowedRoutes.includes(item.href);

  // Verifica se o item é settings e se o usuário tem acesso baseado no plano
  const isSettingsItem = item.href === "/settings";
  const hasPlanAccess =
    !isSettingsItem ||
    isTrial || // Permite acesso durante o trial
    subscription?.plan === "pro" ||
    subscription?.plan === "enterprise";

  // Só mostra o cadeado se:
  // 1. A rota estiver bloqueada E a assinatura estiver bloqueada
  // 2. A rota não estiver na lista de permitidas E a assinatura estiver bloqueada
  // 3. É um item de settings e o usuário não tem acesso ao plano
  const shouldShowLock =
    (isBlocked && isRouteBlocked) || // Mostra cadeado se estiver bloqueado e a rota estiver na lista de bloqueadas
    (isSettingsItem && !hasPlanAccess); // Mostra cadeado se for settings e não tiver acesso ao plano

  // Verifica se a tela requer senha baseado no item
  const requiresPassword = (() => {
    switch (item.href) {
      case "/reports":
        return settings?.lock_reports_by_password;
      case "/settings":
        return settings?.lock_settings_by_password;
      default:
        return false;
    }
  })();

  const button = (
    <div className="px-2 py-1">
      <button
        onClick={onClick}
        className={cn(
          "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
          "transition-all duration-200 ease-in-out",
          "hover:bg-muted/80 active:scale-[0.98]",
          isActive
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "opacity-80 hover:opacity-100",
          "h-10", // Adiciona altura fixa para consistência
        )}
      >
        <item.icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
        <span className="flex-1 text-left">{item.title}</span>
        {(shouldShowLock || requiresPassword) && (
          <Lock className="h-4 w-4 ml-auto" />
        )}
      </button>
    </div>
  );

  // Se for settings e não tiver acesso ao plano (e não estiver no trial)
  if (isSettingsItem && !hasPlanAccess && !isTrial) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <SubscriptionGate
                blockedRoutes={blockedRoutes}
                blockMode="disable"
                fallback={button}
              >
                <SettingsGate
                  requirePanelAccess={item.href.replace("/", "")}
                  fallback={button}
                >
                  {button}
                </SettingsGate>
              </SubscriptionGate>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Configurações disponíveis apenas para planos Pro e Enterprise</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Se a rota estiver bloqueada e não houver assinatura ativa (e não estiver no trial)
  if (
    isRouteBlocked &&
    !isRouteAllowed &&
    isBlocked &&
    !isTrial &&
    !subscriptionActive
  ) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <SubscriptionGate
                blockedRoutes={blockedRoutes}
                blockMode="disable"
                fallback={button}
              >
                <SettingsGate
                  requirePanelAccess={item.href.replace("/", "")}
                  fallback={button}
                >
                  {button}
                </SettingsGate>
              </SubscriptionGate>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Recurso disponível apenas para assinantes</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <SettingsGate
      requirePanelAccess={item.href.replace("/", "")}
      fallback={button}
    >
      {button}
    </SettingsGate>
  );
};

const Sidebar = ({ isOpen, closeSidebar }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    settings,
    appSession,
    isLoading,
    isBlocked,
    isTrial,
    isActive: subscriptionActive,
    subscription,
  } = useWorkspaceContext();

  // Se o app não estiver pronto, mostra um loader
  if (isLoading) {
    return (
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-[130] w-60 bg-background dark:bg-background border-r border-border p-4 shadow-sm transition-transform duration-300 md:translate-x-0 flex flex-col items-center justify-center",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </aside>
    );
  }

  // Lógica para mostrar o cadeado nas configurações
  const isSettingsLocked = settings?.lock_settings_by_password;
  const isSettingsBlocked =
    !isTrial &&
    !subscriptionActive &&
    subscription?.plan !== "pro" &&
    subscription?.plan !== "enterprise";

  const handleProfileClick = async () => {
    try {
      const { data } = await supabase.auth.getSession();

      if (!data?.session) {
        toast({
          title: "Erro ao acessar perfil",
          description: "Você precisa estar logado para acessar seu perfil.",
          variant: "destructive",
        });
        return;
      }

      const websiteUrl = import.meta.env.VITE_ZENCORA_ACCOUNT_WEBSITE;
      if (!websiteUrl) {
        toast({
          title: "Erro ao acessar perfil",
          description: "URL do site de perfil não configurada.",
          variant: "destructive",
        });
        return;
      }

      const accessToken = data.session.access_token;
      const refreshToken = data.session.refresh_token;

      const redirectUrl = `${websiteUrl}account?access_token=${accessToken}&refresh_token=${refreshToken}`;
      window.location.href = redirectUrl;
    } catch (error: any) {
      toast({
        title: "Erro ao acessar perfil",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await db.clearWorkspaceData();
      await supabase.auth.signOut();
      
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado com sucesso.",
      });

      // Redireciona para a landing page
      window.location.href = "/";
    } catch (error: any) {
      toast({
        title: "Erro ao fazer logout",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleNavigation = (href: string) => {
    if (href === import.meta.env.VITE_ZENCORA_ACCOUNT_WEBSITE) {
      handleProfileClick();
      return;
    }
    navigate(href);
    closeSidebar();
  };

  const handleRoleSwitch = () => {
    // Se a configuração de senha para trocar de papel estiver ativa, redireciona para verificação
    if (settings?.require_password_to_switch_role) {
      navigate("/verify-password", {
        state: {
          redirect: "/select-role",
          name: "trocar de papel",
          fromRoleSwitch: true,
        },
      });
    } else {
      // Se não precisar de senha, limpa a role atual e vai direto para a seleção de papéis
      localStorage.removeItem("active_role_id");
      navigate("/select-role");
    }
    closeSidebar();
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[120] bg-black/30 backdrop-blur-sm md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-[130] w-60 bg-background dark:bg-background border-r border-border p-4 shadow-sm transition-transform duration-300 md:translate-x-0 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="px-2 py-2">
          <div className="flex items-center">
            <img
              src="/zencora-noma-logo.png"
              alt="Zencora Noma Logo"
              className="h-8 mr-2"
            />
            <span className="text-xl font-bold zencora-gradient-text">
              Zencora Noma
            </span>
          </div>
        </div>

        <div className="space-y-1 py-4 flex-1">
          {mainNavItems.map((item) => (
            <NavButton
              key={item.href}
              item={item}
              isActive={location.pathname === item.href}
              onClick={() => handleNavigation(item.href)}
            />
          ))}
        </div>

        <div className="mt-auto border-t border-border pt-4">
          {/* Configurações */}
          <Button
            variant="ghost"
            className="w-full flex gap-3 justify-start h-10"
            onClick={() => handleNavigation("/settings")}
          >
            <Settings className="h-4 w-4" />
            Configurações
            {(isSettingsLocked || isSettingsBlocked || isBlocked) && (
              <Lock className="h-4 w-4 ml-auto" />
            )}
          </Button>

          {/* Perfil ou Trocar Papel */}
          {settings?.enable_roles ? (
            appSession?.role === "owner" ? (
              <Button
                variant="ghost"
                className="w-full flex gap-3 justify-start h-10"
                onClick={handleProfileClick}
              >
                <User className="h-4 w-4" />
                Meu Perfil
              </Button>
            ) : (
              <Button
                variant="ghost"
                className="w-full flex gap-3 justify-start h-10"
                onClick={handleRoleSwitch}
              >
                <ArrowLeft className="h-4 w-4" />
                Trocar Papel
              </Button>
            )
          ) : (
            <Button
              variant="ghost"
              className="w-full flex gap-3 justify-start h-10"
              onClick={handleProfileClick}
            >
              <User className="h-4 w-4" />
              Meu Perfil
            </Button>
          )}

          {/* Sair - Sempre visível */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex gap-3 justify-start h-10 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="w-[calc(100%-2rem)] max-w-[400px] mx-auto rounded-xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar saída</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja sair? Você precisará fazer login
                  novamente para acessar o sistema.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                <AlertDialogCancel className="w-full sm:w-auto">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleLogout}
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
                >
                  Sair
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
