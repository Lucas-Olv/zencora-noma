// src/hooks/usePermissions.ts
import { useAuth } from "@/hooks/use-auth";

export const usePermissions = () => {
  const { user } = useAuth();

  const can = (permission: string) => {
    if (!user) return false;

    // Exemplo simples: baseado em role
    const permissionsByRole: Record<string, string[]> = {
      owner: ["view_orders", "edit_orders", "manage_collaborators"],
      collaborator: ["view_orders", "update_status"],
    };

    return permissionsByRole[user.role]?.includes(permission) ?? false;
  };

  return { can };
};
