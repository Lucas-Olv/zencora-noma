import { useEffect } from "react";
import SettingsView from "@/components/settings/SettingsView";

const Settings = () => {
  useEffect(() => {
    document.title = "Configurações | Zencora Noma";
  }, []);

  return <SettingsView />;
};

export default Settings;
