import { useToast } from "@/components/ui/use-toast";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";

// Price IDs for each plan
const PRICE_IDS = {
  essential: {
    monthly: "price_1RWfogFgnU4UhNeIsmPt3uBu",
    yearly: "price_1RWfrfFgnU4UhNeIzZHG46nm",
  },
  pro: {
    monthly: "price_1RWfqPFgnU4UhNeIqkZDJ7nK",
    yearly: "price_1RWfsKFgnU4UhNeIxspyjkeH",
  },
};

export function useSubscriptionHandler() {
  const { toast } = useToast();
  const { product } = useWorkspaceContext();

  const handleCheckout = async (planType: "essential" | "pro", billingCycle: "monthly" | "yearly") => {
    try {
      if (!product?.code) {
        throw new Error("Product ID not found");
      }

      const priceId = PRICE_IDS[planType][billingCycle];
      const userToken = JSON.parse(localStorage.getItem("sb-jbcxnoyvanlategfkwqa-auth-token") || "{}");

      const response = await fetch(`${import.meta.env.VITE_ZENCORA_PAYMENT_API_URL}/checkout/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken.access_token}`,
        },
        body: JSON.stringify({
          productCode: product.code,
          priceId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const data = await response.json();
      window.location.href = data.url;
    } catch (error) {
      console.log(error);
      toast({
        title: "Erro ao processar pagamento",
        description: "Ocorreu um erro ao tentar processar o pagamento. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  return {
    handleCheckout,
  };
} 