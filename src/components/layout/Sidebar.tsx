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
  PackageCheck,
  NotepadText,
} from "lucide-react";
import { cleanWorkspaceData, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SettingsGate } from "@/components/settings/SettingsGate";
import { Loader2 } from "lucide-react";
import { useSessionStorage } from "@/storage/session";
import { useSubscriptionStorage } from "@/storage/subscription";
import { useSettingsStorage } from "@/storage/settings";
import { useMutation } from "@tanstack/react-query";
import { postCoreApi } from "@/lib/apiHelpers";
import dayjs from "dayjs";
import { useAnalytics } from "@/contexts/AnalyticsProviderContext";

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  proOnly?: boolean;
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
    proOnly: true,
  },
  {
    title: "Entregas",
    href: "/delivery",
    icon: PackageCheck,
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
  // {
  //   title: "Calendário",
  //   href: "/calendar",
  //   icon: Calendar,
  // },
];

interface NavButtonProps {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
  isTrial: boolean;
  subscription: any;
  isBlocked: boolean;
  settings: any;
}

const NavButton = ({
  item,
  isActive,
  onClick,
  isTrial,
  subscription,
  settings,
  isBlocked,
}: NavButtonProps) => {
  // Verifica se o usuário tem acesso ao item baseado no plano
  const hasPlanAccess =
    !item.proOnly ||
    isTrial || // Permite acesso durante o trial
    subscription?.plan === "pro"

  // Se o item requer plano Pro e o usuário não tem acesso, não renderiza o botão
  if (item.proOnly && !hasPlanAccess) {
    return null;
  }

  // Verifica se a tela requer senha baseado no item
  const requiresPassword = (() => {
    switch (item.href) {
      case "/reports":
        return settings?.lockReportsByPassword;
      case "/settings":
        return settings?.lockSettingsByPassword;
      default:
        return false;
    }
  })();

  const button = (
    <div className="px-2 py-1">
      <Button
        variant="ghost"
        disabled={isBlocked}
        aria-label={item.title}
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
        {(requiresPassword || isBlocked) && (
          <Lock className="h-4 w-4 ml-auto" />
        )}
      </Button>
    </div>
  );

  // Se for item Pro e não tiver acesso ao plano (e não estiver no trial)
  if (item.proOnly && !hasPlanAccess && !isTrial) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <SettingsGate
                requirePanelAccess={item.href.replace("/", "")}
                fallback={button}
              >
                {button}
              </SettingsGate>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Recurso disponível apenas para planos Pro e Enterprise</p>
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
  const { trackEvent } = useAnalytics();

  // Zustand stores
  const { subscription } = useSubscriptionStorage();
  const { settings } = useSettingsStorage();

  const { mutate: logout } = useMutation({
    mutationFn: () => postCoreApi("/api/core/v1/signout"),
    onSuccess: async () => {
      await cleanWorkspaceData();
      toast({
        title: "Sessão encerrada",
        description: "Sua sessão foi encerrada com sucesso. Até breve!",
      });
      trackEvent("user_signout");
    },
    onError: (error) => {
      toast({
        title: "Erro ao sair",
        description: error.message,
      });
    },
  });

  // Derivações
  const isLoading = false; // zustand é síncrono, pode-se adicionar loading se necessário
  const isTrial = !!subscription?.isTrial;
  const isActive =
    subscription?.status === "active" &&
    dayjs(subscription?.expiresAt).isAfter(dayjs()) &&
    dayjs(subscription?.gracePeriodUntil).isAfter(dayjs());

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
  const isSettingsLocked = settings?.lockSettingsByPassword;
  const isSettingsBlocked = !isTrial && !isActive;

  const handleProfileClick = async () => {
    try {
      const websiteUrl = import.meta.env.VITE_ZENCORA_ACCOUNT_WEBSITE;
      if (!websiteUrl) {
        toast({
          title: "Erro ao acessar perfil",
          description: "URL do site de perfil não configurada.",
          variant: "destructive",
        });
        return;
      }
      const accessToken = useSessionStorage.getState().session.token;
      const redirectUrl = `${websiteUrl}/account?access_token=${accessToken}`;
      window.location.href = redirectUrl;
      trackEvent("user_profile_access");
    } catch (error: any) {
      toast({
        title: "Erro ao acessar perfil",
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
              className="h-6 mr-2"
            />
            <span className="text-lg font-bold zencora-gradient-text">
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
              isTrial={isTrial}
              subscription={subscription}
              isBlocked={!isActive}
              settings={settings}
            />
          ))}
        </div>

        <div className="mt-auto border-t border-border pt-4">
          {/* Configurações */}
          {(!subscription?.plan ||
            subscription?.plan === "pro" ||
            subscription?.plan === "enterprise" ||
            isTrial) && (
            <Button
              variant="ghost"
              disabled={isSettingsBlocked || !isActive}
              className={cn(
                "w-full flex gap-3 justify-start h-10",
                location.pathname === "/settings"
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "",
              )}
              onClick={() => handleNavigation("/settings")}
            >
              <Settings className="h-4 w-4" />
              Configurações
              {(isSettingsLocked || isSettingsBlocked || !isActive) && (
                <Lock className="h-4 w-4 ml-auto" />
              )}
            </Button>
          )}

          {/* Perfil ou Trocar Papel */}
          <Button
            variant="ghost"
            className="w-full flex gap-3 justify-start h-10"
            onClick={handleProfileClick}
          >
            <User className="h-4 w-4" />
            Meu Perfil
          </Button>

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
            <AlertDialogContent>
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
                  onClick={() => {
                    logout();
                    closeSidebar();
                  }}
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
