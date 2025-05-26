import { InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
const SubscriptionInfo = () => {
  const [mounted, setMounted] = useState(false);
  const { isBlocked: isSubscriptionBlocked } = useSubscription();
  const { isTrial } = useSubscription();
  const { isPaymentFailed } = useSubscription();
  const { isExpired } = useSubscription();

  const headerSubscriptionStatusWarning = isTrial && isExpired ? "Seu período de teste expirou" : isSubscriptionBlocked ? "Sua assinatura expirou" : isPaymentFailed ? "Ocorreu um erro no pagamento, por favor, verifique seus meios de pagamento" : isExpired ? "Sua assinatura expirou" : isTrial ? "Você está em período de teste" : "";

  const headerSubscriptionStatusWarningColor = isTrial && isExpired ? "text-red-500" : isSubscriptionBlocked ? "text-red-500" : isPaymentFailed ? "text-red-500" : isExpired ? "text-red-500" : isTrial ? "text-yellow-500" : "";

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
          <InfoIcon className={cn(headerSubscriptionStatusWarningColor, "h-5 w-5")} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <span className={cn(headerSubscriptionStatusWarningColor)}>{headerSubscriptionStatusWarning}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SubscriptionInfo;
