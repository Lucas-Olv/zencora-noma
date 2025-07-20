import React, { createContext, useContext, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { getAnalytics, logEvent } from "firebase/analytics";

// Tipo do contexto
type AnalyticsContextType = {
  trackEvent: (eventName: string, params?: Record<string, any>) => void;
};

// Criando contexto
const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const location = useLocation();
  const analytics = getAnalytics(); // Pega instância do Firebase Analytics

  // Dispara screen_view a cada mudança de rota
  React.useEffect(() => {
    const pagePath = location.pathname + location.search;
    logEvent(analytics, "screen_view", {
      firebase_screen: pagePath,
      firebase_screen_class: pagePath,
    });
  }, [location, analytics]);

  // Função para eventos customizados
  const trackEvent = useCallback(
    (eventName: string, params: Record<string, any> = {}) => {
      logEvent(analytics, eventName, params);
    },
    [analytics],
  );

  return (
    <AnalyticsContext.Provider value={{ trackEvent }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

// Hook para usar facilmente o analytics
export const useAnalytics = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error(
      "useAnalytics deve ser usado dentro de um <AnalyticsProvider>",
    );
  }
  return context;
};
