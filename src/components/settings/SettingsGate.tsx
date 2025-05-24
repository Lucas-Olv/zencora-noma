// components/SettingsGate.tsx
import { ReactNode } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Loader2 } from 'lucide-react';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  requireRolesEnabled?: boolean;
  requireFeature?: keyof ReturnType<typeof useSettings>['settings'];
  requirePanelAccess?: string; // ex: 'dashboard', 'orders', etc.
};

export const SettingsGate = ({
  children,
  fallback = <Loader2 className="animate-spin" />,
  requireRolesEnabled,
  requireFeature,
  requirePanelAccess,
}: Props) => {
  const { settings, selectedRole, loading } = useSettings();

  if (loading) return fallback;

  // Bloqueia se roles estiverem desabilitados e ele exige que estejam ativos
  if (requireRolesEnabled && !settings?.enable_roles) return null;

  // Bloqueia se uma feature específica está desativada (como lock_reports_with_password)
  if (requireFeature && !settings?.[requireFeature]) return null;

  // Bloqueia se a role atual não tiver acesso ao painel exigido
  if (requirePanelAccess && settings?.enable_roles) {
    if (!selectedRole || !selectedRole.accessible_panels.includes(requirePanelAccess)) {
      return null;
    }
  }

  return <>{children}</>;
};
