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
import { SubscriptionGate, useSubscriptionRoutes } from "@/components/subscription/SubscriptionGate";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SettingsGate } from "@/components/settings/SettingsGate";
import { useAppReady } from "@/hooks/use-app-ready";
import { Loader2 } from "lucide-react";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";

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
  const { settings, isBlocked, isTrial, isActive: subscriptionActive, subscription } = useWorkspaceContext();
  const isRouteBlocked = blockedRoutes.includes(item.href);
  const isRouteAllowed = allowedRoutes.includes(item.href);

  // Verifica se o item é settings e se o usuário tem acesso baseado no plano
  const isSettingsItem = item.href === '/settings';
  const hasPlanAccess = !isSettingsItem || 
    isTrial || // Permite acesso durante o trial
    subscription?.plan === 'pro' || 
    subscription?.plan === 'enterprise';

  // Só mostra o cadeado se:
  // 1. A rota estiver bloqueada E a assinatura estiver bloqueada
  // 2. A rota não estiver na lista de permitidas E a assinatura estiver bloqueada
  // 3. É um item de settings e o usuário não tem acesso ao plano
  const shouldShowLock = ((isRouteBlocked || (!isRouteAllowed && isBlocked)) && !isTrial && !subscriptionActive) || 
    (isSettingsItem && !hasPlanAccess);

  // Verifica se a tela requer senha baseado no item
  const requiresPassword = (() => {
    switch (item.href) {
      case '/reports':
        return settings?.lock_reports_by_password;
      case '/settings':
        return settings?.lock_settings_by_password;
      default:
        return false;
    }
  })();

  const button = (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
        "transition-all duration-200 ease-in-out",
        "hover:bg-muted/80 active:scale-[0.98]",
        isActive
          ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
          : "opacity-80 hover:opacity-100",
      )}
    >
      <item.icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
      {item.title}
      {(shouldShowLock || requiresPassword) && <Lock className="h-4 w-4 ml-auto text-muted-foreground" />}
    </button>
  );

  // Se for settings e não tiver acesso ao plano, mostra o botão bloqueado
  if (isSettingsItem && !hasPlanAccess) {
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
                  requirePanelAccess={item.href.replace('/', '')}
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

  if (isRouteBlocked && !isRouteAllowed && isBlocked && !isTrial && !subscriptionActive) {
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
                  requirePanelAccess={item.href.replace('/', '')}
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
      requirePanelAccess={item.href.replace('/', '')}
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
  const { settings, isOwner } = useWorkspaceContext();
  const { ready: appReady, loading: appLoading } = useAppReady();

  // Se o app não estiver pronto, mostra um loader
  if (!appReady || appLoading) {
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

  const handleLogoClick = () => {
    // Se estiver na página de seleção de papel, não faz nada
    if (location.pathname === "/select-role") return;
    
    // Se estiver em qualquer outra página, vai para o dashboard
    navigate("/dashboard");
    closeSidebar();
  };

  const handleProfileClick = async () => {
    try {
      const { session, error } = await supabaseService.auth.getCurrentSession();

      if (error) throw error;
      if (!session) {
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

      // Gera um token de acesso para o site externo
      const { session: currentSession, error: tokenError } =
        await supabaseService.auth.getCurrentSession();

      if (tokenError) throw tokenError;
      if (!currentSession?.access_token)
        throw new Error("Token de acesso não encontrado");

      // Adiciona o token como parâmetro na URL
      const urlWithToken = `${websiteUrl}account?token=${currentSession.access_token}`;
      window.open(urlWithToken, "_blank");
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
      const { error } = await supabaseService.auth.signOut();
      if (error) throw error;

      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });

      navigate("/");
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
          fromRoleSwitch: true
        }
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
          <button onClick={handleLogoClick} className="flex items-center">
            <img
              src="/noma-logo.svg"
              alt="Zencora Noma Logo"
              className="h-8 mr-2"
            />
            <span className="text-xl font-bold zencora-gradient-text">
              Zencora Noma
            </span>
          </button>
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
          {bottomNavItems.map((item) => (
            <NavButton
              key={item.href}
              item={item}
              isActive={location.pathname === item.href}
              onClick={() => handleNavigation(item.href)}
            />
          ))}

          {/* Perfil ou Trocar Papel */}
          {settings?.enable_roles ? (
            isOwner ? (
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
