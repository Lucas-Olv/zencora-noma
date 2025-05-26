import { useAuthContext } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useSubscription } from "@/contexts/SubscriptionContext";

const useAppReady = () => {
  const {
    isAuthenticated,
    loading: authLoading,
    user,
    tenant,
  } = useAuthContext();

  const { loading: settingsLoading } = useSettings();
  const { subscription, isLoading: subscriptionLoading } = useSubscription();

  const ready =
    isAuthenticated &&
    !authLoading &&
    !settingsLoading &&
    !subscriptionLoading &&
    !!user &&
    !!tenant &&
    !!subscription;

  return {
    ready,
    loading: authLoading || settingsLoading || subscriptionLoading,
    user,
    tenant,
    subscription,
  };
};

export { useAppReady };
