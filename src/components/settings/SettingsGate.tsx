// components/SettingsGate.tsx
import { ReactNode } from 'react';
import { useWorkspaceContext } from '@/contexts/WorkspaceContext';
import { Loader2 } from 'lucide-react';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  requireRolesEnabled?: boolean;
  requireFeature?: keyof ReturnType<typeof useWorkspaceContext>['settings'];
  requirePanelAccess?: string; // ex: 'dashboard', 'orders', etc.
};

export const SettingsGate = ({
  children,
  fallback = <Loader2 className="animate-spin" />,
  requireRolesEnabled,
  requireFeature,
  requirePanelAccess,
}: Props) => {
  const { settings, selectedRole, loading, isOwner } = useWorkspaceContext();

  if (loading) return fallback;

  // Se for owner, permite acesso a tudo
  if (isOwner) return <>{children}</>;

  // Bloqueia se roles estiverem desabilitados e ele exige que estejam ativos
  if (requireRolesEnabled && !settings?.enable_roles) return null;

  // Bloqueia se uma feature específica está desativada (como lock_reports_with_password)
  if (requireFeature && !settings?.[requireFeature]) return null;

  // Bloqueia se a role atual não tiver acesso ao painel exigido
  if (requirePanelAccess && settings?.enable_roles && selectedRole) {
    const hasAccess = (() => {
      switch (requirePanelAccess) {
        case 'dashboard':
          return selectedRole.can_access_dashboard;
        case 'orders':
          return selectedRole.can_access_orders;
        case 'calendar':
          return selectedRole.can_access_calendar;
        case 'production':
          return selectedRole.can_access_production;
        case 'reports':
          return selectedRole.can_access_reports;
        case 'reminders':
          return selectedRole.can_access_reminders;
        case 'settings':
          return selectedRole.can_access_settings;
        default:
          return false;
      }
    })();

    if (!hasAccess) return null;
  }

  return <>{children}</>;
};
