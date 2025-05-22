import { createContext, useContext, useEffect, useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext'; // ou onde estiver seu auth context
import { supabase } from '@/integrations/supabase/client'; // ajuste conforme sua estrutura
import dayjs from 'dayjs';

type SubscriptionStatus =
  | 'trial'
  | 'active'
  | 'cancelled'
  | 'expired'
  | 'payment_failed'
  | 'paused';

type Subscription = {
  status: SubscriptionStatus;
  plan: string;
  started_at: string;
  expires_at: string;
  cancel_at_period_end: boolean;
  cancelled_at?: string | null;
  payment_failed_at?: string | null;
  is_trial: boolean;
  grace_period_until?: string | null;
};

type SubscriptionContextType = {
  subscription: Subscription | null;
  isLoading: boolean;
  isTrial: boolean;
  isActive: boolean;
  isExpired: boolean;
  isPaymentFailed: boolean;
  isBlocked: boolean;
  showWarning: boolean;
};

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: null,
  isLoading: true,
  isTrial: false,
  isActive: false,
  isExpired: false,
  isPaymentFailed: false,
  isBlocked: false,
  showWarning: false,
});

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthContext();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar assinatura:', error);
        setSubscription(null);
      } else {
        setSubscription(data);
      }

      setIsLoading(false);
    };

    fetchSubscription();
  }, [user]);

  const now = dayjs();
  const expiresAt = subscription?.expires_at ? dayjs(subscription.expires_at) : null;
  const graceUntil = subscription?.grace_period_until ? dayjs(subscription.grace_period_until) : null;

  const isTrial = subscription?.status === 'trial';
  const isActive = subscription?.status === 'active';
  const isCancelled = subscription?.status === 'cancelled';
  const isPaymentFailed = subscription?.status === 'payment_failed';
  const isExpired = expiresAt ? now.isAfter(expiresAt) : false;

  const inGracePeriod = graceUntil ? now.isBefore(graceUntil) : false;

  // Bloqueia se:
  // 1. Está expirado e fora do período de graça
  // 2. Tem falha de pagamento
  // 3. Está cancelado
  // 4. Não tem assinatura
  const isBlocked = !subscription || isPaymentFailed || isCancelled || (isExpired && !inGracePeriod);

  // Mostra alerta se está prestes a expirar ou com falha de pagamento
  const showWarning =
    (expiresAt && expiresAt.diff(now, 'day') <= 3 && !isBlocked) || isPaymentFailed;

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        isLoading,
        isTrial,
        isActive,
        isExpired,
        isPaymentFailed,
        isBlocked,
        showWarning,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => useContext(SubscriptionContext);
