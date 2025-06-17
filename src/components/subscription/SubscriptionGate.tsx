import { Loader2 } from "lucide-react";
import {
  ReactNode,
  useEffect,
  cloneElement,
  createContext,
  useContext,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { useSubscriptionStorage } from "@/storage/subscription";
import { useSessionStore } from "@/storage/session";
import dayjs from "dayjs";

interface SubscriptionRoutesContextType {
  blockedRoutes: string[];
  allowedRoutes: string[];
}

const SubscriptionRoutesContext = createContext<
  SubscriptionRoutesContextType | undefined
>(undefined);

export const useSubscriptionRoutes = () => {
  const context = useContext(SubscriptionRoutesContext);
  if (!context) {
    throw new Error(
      "useSubscriptionRoutes deve ser usado dentro do SubscriptionGate",
    );
  }
  return context;
};

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
  onlyActive?: boolean;
  blockedRoutes?: string[];
  allowedRoutes?: string[];
  blockMode?: "hide" | "disable";
  onBlock?: () => void;
};

// Rota padrão que sempre deve ser permitida
const DEFAULT_ALLOWED_ROUTE = "/subscription-expired";

export const SubscriptionGate = ({
  children,
  fallback = (
    <div className="flex justify-center items-center h-screen">
      <Loader2 className="animate-spin w-10 h-10" />
    </div>
  ),
  redirectTo,
  onlyActive = false,
  blockedRoutes = [],
  allowedRoutes = [],
  blockMode = "hide",
  onBlock,
}: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading } = useWorkspaceContext();
  const { session } = useSessionStore();
  const { subscription } = useSubscriptionStorage();

  const path = location.pathname;

  // Função para verificar se uma rota corresponde ao padrão
  const isRouteMatch = (routePattern: string, currentPath: string) => {
    // Se for uma rota exata
    if (routePattern === currentPath) return true;

    // Se for uma rota com parâmetro (ex: /orders/:id)
    if (routePattern.includes(":")) {
      const patternParts = routePattern.split("/");
      const pathParts = currentPath.split("/");

      if (patternParts.length !== pathParts.length) return false;

      return patternParts.every((part, index) => {
        if (part.startsWith(":")) return true;
        return part === pathParts[index];
      });
    }

    return false;
  };

  // Verifica se a rota atual está nas rotas permitidas
  const isRouteAllowed =
    path === DEFAULT_ALLOWED_ROUTE ||
    (allowedRoutes?.length
      ? allowedRoutes.some((route) => isRouteMatch(route, path))
      : false);

  // Verifica se a rota atual está nas rotas bloqueadas
  const isRouteBlocked =
    path !== DEFAULT_ALLOWED_ROUTE &&
    (blockedRoutes?.length
      ? blockedRoutes.some((route) => isRouteMatch(route, path))
      : false);

  // Verifica se o status da assinatura permite acesso
  const allowedByStatus = onlyActive
    ? (subscription?.status === "active" && dayjs(subscription?.expiresAt).isBefore(dayjs())) || dayjs(subscription?.gracePeriodUntil).isAfter(dayjs()) // Se onlyActive, verifica se está ativo E não expirado OU em período de graça
    : subscription?.isTrial || (subscription?.status === "active" && dayjs(subscription?.expiresAt).isAfter(dayjs())) || dayjs(subscription?.gracePeriodUntil).isBefore(dayjs()); // Se não onlyActive, verifica se está em trial OU (ativo E não expirado) OU em período de graça

  // Verifica se o plano permite acesso
  const isProPlan =
    subscription?.plan === "pro" || subscription?.plan === "enterprise";
  const isEssentialPlan = subscription?.plan === "essential";

  // Determina se deve bloquear o acesso
  const shouldBlock =
    (session &&
      path !== DEFAULT_ALLOWED_ROUTE &&
      // Se a assinatura é válida (não está bloqueada e tem status permitido), permite acesso por padrão
      // Se a assinatura é inválida, aplica as regras do Gate
      (!allowedByStatus) &&
      // Se tiver allowedRoutes, usa a lógica de allowed
      ((allowedRoutes?.length && !isRouteAllowed) ||
        // Se tiver blockedRoutes, usa a lógica de blocked
        (blockedRoutes?.length && isRouteBlocked) ||
        // Se não tiver nenhum dos dois, bloqueia por padrão
        (!allowedRoutes?.length && !blockedRoutes?.length))) ||
    // Bloqueia acesso ao painel de produção e configurações para plano essencial
    (isEssentialPlan &&
      (path.startsWith("/production") || path.startsWith("/settings")));


  useEffect(() => {
    if (!isLoading && shouldBlock && redirectTo && path !== redirectTo) {
      navigate(redirectTo);
    }

    if (!isLoading && shouldBlock && onBlock) {
      onBlock();
    }
  }, [isLoading, shouldBlock, redirectTo, navigate, onBlock, path]);

  // Se não estiver autenticado, renderiza normalmente
  if (!session) {
    return <>{children}</>;
  }

  // Se estiver carregando, mostra o fallback
  if (isLoading) {
    return fallback;
  }

  // Se não deve bloquear, renderiza normalmente
  if (!shouldBlock) {
    return (
      <SubscriptionRoutesContext.Provider
        value={{ blockedRoutes, allowedRoutes }}
      >
        {children}
      </SubscriptionRoutesContext.Provider>
    );
  }

  // Se deve bloquear e tem redirectTo, mostra o fallback enquanto redireciona
  if (redirectTo) {
    return fallback;
  }

  // Se deve bloquear e não tem redirectTo, aplica o blockMode
  if (blockMode === "disable") {
    const element = children as React.ReactElement;
    return cloneElement(element, {
      ...element.props,
      disabled: true,
      style: {
        ...(element.props?.style || {}),
        opacity: 0.5,
        cursor: "not-allowed",
      },
    });
  }

  // Se blockMode é 'hide', não renderiza nada
  return null;
};
