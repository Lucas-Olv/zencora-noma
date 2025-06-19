// components/SettingsGate.tsx
import { ReactNode, cloneElement } from "react";
import { Loader2 } from "lucide-react";
import { useSettingsStorage } from "@/storage/settings";

type PermissionType = "create" | "edit" | "delete";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  requireRolesEnabled?: boolean;
  requireFeature?: string;
  requirePanelAccess?: string; // ex: 'dashboard', 'orders', etc.
  permission?: PermissionType;
  blockMode?: "hide" | "disable";
};

export const SettingsGate = ({
  children,
  fallback = <Loader2 className="animate-spin" />,
  requireFeature,
}: Props) => {
  const { settings } = useSettingsStorage();

  // Bloqueia se uma feature específica está desativada (como lock_reports_with_password)
  if (requireFeature && !settings?.[requireFeature]) return null;

  return <>{children}</>;
};
