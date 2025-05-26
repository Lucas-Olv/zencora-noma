import { useAuthContext } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";

const useAppReady = () => {
  const {
    isAuthenticated,
    loading: authLoading,
    user,
    tenant,
  } = useAuthContext();

  const { loading: settingsLoading } = useSettings();

  const ready =
    isAuthenticated &&
    !authLoading &&
    !settingsLoading &&
    !!user &&
    !!tenant;

  return {
    ready,
    loading: authLoading || settingsLoading,
    user,
    tenant,
  };
};

export { useAppReady };
