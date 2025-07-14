import { InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import dayjs from "dayjs";
import { useSubscriptionStorage } from "@/storage/subscription";

const SubscriptionInfo = () => {
  const [mounted, setMounted] = useState(false);
  const { subscription } = useSubscriptionStorage();

  // Verifica se a assinatura está próxima de expirar (3 dias)
  const isAboutToExpire =
    subscription?.expiresAt &&
    dayjs(subscription.expiresAt).diff(dayjs(), "day") <= 3 &&
    subscription.status === "cancelled";

  // Verifica se a assinatura está próxima de renovar (3 dias)
  const isAboutToRenew =
    subscription?.expiresAt &&
    dayjs(subscription.expiresAt).diff(dayjs(), "day") <= 3 &&
    subscription.status === "active";

  // Verifica se a assinatura está ativa e válida
  const isActive =
    subscription?.status === "active" &&
    dayjs(subscription?.expiresAt).isAfter(dayjs()) &&
    dayjs(subscription?.gracePeriodUntil).isAfter(dayjs());
  // Verifica se período de teste terminou
  const isTrialExpired =
    subscription?.isTrial && dayjs(subscription?.expiresAt).isBefore(dayjs());
  // Verifica se assinatura é periodo de teste
  const isTrial = subscription?.isTrial;
  // Verifica se o pagamento falhou
  const isPaymentFailed = subscription.status === "payment_failed";

  const headerSubscriptionStatusWarning = isTrialExpired
    ? "Seu período de teste expirou"
    : !isActive
      ? "Sua assinatura expirou"
      : isPaymentFailed
        ? "Ocorreu um erro no pagamento, por favor, verifique seus meios de pagamento"
        : isActive && isTrial
          ? "Você está em período de teste"
          : isAboutToExpire
            ? "Sua assinatura irá expirar em breve"
            : isAboutToRenew
              ? "Sua assinatura será renovada em breve"
              : isActive
                ? "Sua assinatura está ativa"
                : "";

  const headerSubscriptionStatusWarningColor =
    isTrialExpired || !isActive || isPaymentFailed
      ? "text-red-500"
      : isTrial
        ? "text-yellow-500"
        : isAboutToExpire
          ? "text-red-500"
          : isAboutToRenew
            ? "text-yellow-500"
            : isActive
              ? "text-green-500"
              : "";

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="Toggle theme"
        >
          <InfoIcon
            className={cn(headerSubscriptionStatusWarningColor, "h-5 w-5")}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <span className={cn(headerSubscriptionStatusWarningColor)}>
            {headerSubscriptionStatusWarning}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SubscriptionInfo;
