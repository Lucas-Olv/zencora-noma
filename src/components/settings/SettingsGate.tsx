// components/SettingsGate.tsx
import { ReactNode, cloneElement } from 'react';
import { useWorkspaceContext } from '@/contexts/WorkspaceContext';
import { Loader2 } from 'lucide-react';

type PermissionType = 'create' | 'edit' | 'delete';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  requireRolesEnabled?: boolean;
  requireFeature?: keyof ReturnType<typeof useWorkspaceContext>['settings'];
  requirePanelAccess?: string; // ex: 'dashboard', 'orders', etc.
  permission?: PermissionType;
  blockMode?: 'hide' | 'disable';
};

export const SettingsGate = ({
  children,
  fallback = <Loader2 className="animate-spin" />,
  requireRolesEnabled,
  requireFeature,
  requirePanelAccess,
  permission,
  blockMode = 'hide',
}: Props) => {
  const { settings, selectedRole, isLoading, isOwner } = useWorkspaceContext();

  if (isLoading) return fallback;

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

  // Verifica permissões específicas (create, edit, delete)
  if (permission && settings?.enable_roles && selectedRole) {
    const hasPermission = (() => {
      switch (permission) {
        case 'create':
          return selectedRole.can_create_orders;
        case 'edit':
          return selectedRole.can_edit_orders;
        case 'delete':
          return selectedRole.can_delete_orders;
        default:
          return false;
      }
    })();

    if (!hasPermission) {
      // Se não tem permissão e o modo é 'disable', desabilita o elemento
      if (blockMode === 'disable') {
        const element = children as React.ReactElement;
        return cloneElement(element, {
          ...element.props,
          disabled: true,
          style: {
            ...(element.props?.style || {}),
            opacity: 0.5,
            cursor: 'not-allowed',
          },
        });
      }
      // Se não tem permissão e o modo é 'hide', não renderiza nada
      return null;
    }
  }

  return <>{children}</>;
};
