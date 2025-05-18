// src/components/auth/IfCan.tsx
import { ReactNode } from "react";
import { usePermissions } from "@/hooks/use-permissions";

interface Props {
  permission: string;
  children: ReactNode;
}

export function IfCan({ permission, children }: Props) {
  const { can } = usePermissions();
  return can(permission) ? <>{children}</> : null;
}
