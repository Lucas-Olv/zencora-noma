import { createContext, useContext, useEffect, useState } from "react";
import { db } from "@/lib/db";
import { useProductStore } from "@/storage/product";
import { useSessionStore } from "@/storage/session";
import { useSubscriptionStorage } from "@/storage/subscription";
import { useTenantStorage } from "@/storage/tenant";
import { useSettingsStorage } from "@/storage/settings";
import { postNomaApi } from "@/lib/apiHelpers";

interface WorkspaceContextType {
  loadWorkspace: () => Promise<void>;
  isLoading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined,
);

export const WorkspaceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { session } = useSessionStore();
  const { subscription } = useSubscriptionStorage();
  const { tenant } = useTenantStorage();
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    loadWorkspace();
  }, [session]);

  const loadWorkspace = async () => {
    setIsLoading(true);
    if(session) {
      if (!subscription || !tenant) {
      const workspaceData = await postNomaApi("/api/noma/v1/workspace/init");
      if (workspaceData) {
        await db.init();
        await useProductStore.getState().setProduct(workspaceData.product);
        await useSubscriptionStorage
          .getState()
          .setSubscription(workspaceData.subscription);
        await useTenantStorage.getState().setTenant(workspaceData.tenant);
        await useSettingsStorage.getState().setSettings(workspaceData.settings);
      } else {
        await useProductStore.getState().loadProduct();
        await useSessionStore.getState().restoreSession();
        await useSubscriptionStorage.getState().loadSubscription();
        await useTenantStorage.getState().loadTenant();
        await useSettingsStorage.getState().loadSettings();
      }
      return;
    }
    } else {
      await db.init();
        await useProductStore.getState().loadProduct();
    }
    setIsLoading(false);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        loadWorkspace,
        isLoading,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

const useWorkspaceContext = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error(
      "useWorkspace precisa ser usado dentro do WorkspaceProvider",
    );
  }
  return context;
};

export { useWorkspaceContext };
