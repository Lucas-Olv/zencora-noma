import { createContext, useContext, useEffect, useState } from "react";
import { db } from "@/lib/db";
import { useProductStore } from "@/storage/product";
import { useSessionStorage } from "@/storage/session";
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWorkspace();
  }, []);

  const loadWorkspace = async () => {
    setIsLoading(true);
    await db.init();
    await useProductStore.getState().loadProduct();
    await useSessionStorage.getState().restoreSession();
    await useProductStore.getState().loadProduct();
    await useSubscriptionStorage.getState().loadSubscription();
    await useTenantStorage.getState().loadTenant();
    await useSettingsStorage.getState().loadSettings();

    const session = useSessionStorage.getState().session;
    const subscription = useSubscriptionStorage.getState().subscription;
    const tenant = useTenantStorage.getState().tenant;
    const settings = useSettingsStorage.getState().settings;

    if (session) {
      if (!subscription || !tenant || !settings) {
        const workspaceData = await postNomaApi("/api/noma/v1/workspace/init");
        if (workspaceData?.data) {
          await db.init();
          await useProductStore.getState().loadProduct();
          await useSubscriptionStorage
            .getState()
            .setSubscription(workspaceData.data.subscription);
          await useTenantStorage
            .getState()
            .setTenant(workspaceData.data.tenant);
          await useSettingsStorage
            .getState()
            .setSettings(workspaceData.data.settings);
        }
      }
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
