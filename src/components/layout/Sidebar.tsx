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
import { Link } from "react-router-dom";
import { SubscriptionGate, useSubscriptionRoutes } from "@/components/subscription/SubscriptionGate";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSubscription } from "@/contexts/SubscriptionContext";

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
    title: "Calendário",
    href: "/calendar",
    icon: Calendar,
  },
];

const bottomNavItems: NavItem[] = [
  {
    title: "Meu Perfil",
    href: import.meta.env.VITE_ZENCORA_ACCOUNT_WEBSITE || "/profile",
    icon: User,
  },
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
  const { isBlocked: isSubscriptionBlocked } = useSubscription();
  const isRouteBlocked = blockedRoutes.includes(item.href);
  const isRouteAllowed = allowedRoutes.includes(item.href);

  // Só mostra o cadeado se a rota estiver bloqueada E a assinatura não estiver ativa
  const shouldShowLock = isSubscriptionBlocked && (isRouteBlocked || isRouteAllowed);

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
      {shouldShowLock && <Lock className="h-4 w-4 ml-auto text-muted-foreground" />}
    </button>
  );

  if (isRouteBlocked || isRouteAllowed) {
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
                {button}
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

  return button;
};

const Sidebar = ({ isOpen, closeSidebar }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

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
          <Link to="/" className="flex items-center">
            <img
              src="/noma-logo.svg"
              alt="Zencora Noma Logo"
              className="h-8 mr-2"
            />
            <span className="text-xl font-bold zencora-gradient-text">
              Zencora Noma
            </span>
          </Link>
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
