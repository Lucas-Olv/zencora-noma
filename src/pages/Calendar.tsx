
import { useEffect } from "react";

const Calendar = () => {
  useEffect(() => {
    document.title = "Calendário | Zencora Noma";
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Calendário</h2>
        <p className="text-muted-foreground">
          Visualize suas encomendas em um calendário.
        </p>
      </div>
      
      <div className="bg-card border rounded-lg p-8 text-center text-muted-foreground">
        <p>Funcionalidade de calendário em desenvolvimento.</p>
        <p>Em breve você poderá visualizar todas suas encomendas em um calendário interativo.</p>
      </div>
    </div>
  );
};

export default Calendar;
