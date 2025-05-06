
import { useEffect } from "react";

const Settings = () => {
  useEffect(() => {
    document.title = "Configurações | Zencora Noma";
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">
          Gerencie as configurações do seu aplicativo.
        </p>
      </div>
      
      <div className="bg-card border rounded-lg p-8 text-center text-muted-foreground">
        <p>Página de configurações em desenvolvimento.</p>
        <p>Em breve você poderá personalizar seu aplicativo Zencora Noma.</p>
      </div>
    </div>
  );
};

export default Settings;
