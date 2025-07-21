import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useSubscriptionHandler } from "@/hooks/use-subscription-handler";
import { useTenantStorage } from "@/storage/tenant";

// Price IDs for each plan
const PRICE_IDS = {
  essential: {
    monthly: "prod_SRYwn3kA5ohCpb",
    yearly: "prod_SRYzydrs4CnWwu",
  },
  pro: {
    monthly: "prod_SRYyr3AIma4Koq",
    yearly: "prod_SSnpEuDif9BA4c",
  },
};

interface PricingTierProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  ctaText: string;
  isPro?: boolean;
  delay: string;
  freeTrialDays?: number;
  smallText?: string;
  onSubscribe: () => void;
  isLoading?: boolean;
}

function PricingTier({
  name,
  price,
  description,
  features,
  ctaText,
  isPro = false,
  delay,
  freeTrialDays,
  smallText,
  onSubscribe,
  isLoading = false,
}: PricingTierProps) {
  return (
    <div
      className={`reveal delay-[${delay}] w-full relative rounded-2xl ${
        isPro
          ? "bg-gradient-to-b from-secondary to-primary border-0"
          : "bg-card border"
      }`}
    >
      {isPro && (
        <div className="inset-px rounded-2xl border-2 border-primary bg-card z-10">
          <div className="h-full w-full p-6 md:p-8 flex flex-col">
            {freeTrialDays && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-base font-medium px-4 py-1 rounded-full">
                {freeTrialDays} dias grátis
              </div>
            )}
            <div className="mb-4">
              <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {name}
              </h3>
              <div className="mt-2">
                <span className="text-3xl font-bold">{price}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {description}
              </p>
            </div>
            <ul className="mb-8 space-y-3 flex-grow">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="h-5 w-5 mr-2 text-primary" />
                  <span className="text-foreground/80">{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto">
              {smallText && (
                <p className="text-sm text-muted-foreground mb-4">
                  {smallText}
                </p>
              )}
              <Button
                className="w-full bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90"
                onClick={onSubscribe}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  ctaText
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {!isPro && (
        <div className="h-full w-full p-6 md:p-8 flex flex-col">
          {freeTrialDays && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-base font-medium px-4 py-1 rounded-full">
              {freeTrialDays} dias grátis
            </div>
          )}
          <div className="mb-4">
            <h3 className="text-xl font-bold">{name}</h3>
            <div className="mt-2">
              <span className="text-3xl font-bold">{price}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </div>
          <ul className="mb-8 space-y-3 flex-grow">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <Check className="h-5 w-5 mr-2 text-primary" />
                <span className="text-foreground/80">{feature}</span>
              </li>
            ))}
          </ul>
          <div className="mt-auto">
            {smallText && (
              <p className="text-sm text-muted-foreground mb-4">{smallText}</p>
            )}
            <Button
              variant="outline"
              className="w-full border-primary text-primary hover:bg-primary hover:text-white"
              onClick={onSubscribe}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                ctaText
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface PricingSectionProps {
  useSubscription?: boolean;
}

export function PricingSection({
  useSubscription = false,
}: PricingSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const [isLoading, setIsLoading] = useState<"essential" | "pro" | null>(null);
  const { toast } = useToast();
  const { tenant } = useTenantStorage();
  const { handleCheckout } = useSubscriptionHandler();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          }
        });
      },
      { threshold: 0.1 },
    );

    const section = sectionRef.current;
    if (section) {
      const elements = section.querySelectorAll(".reveal");
      elements.forEach((el) => observer.observe(el));
    }

    return () => {
      if (section) {
        const elements = section.querySelectorAll(".reveal");
        elements.forEach((el) => observer.unobserve(el));
      }
    };
  }, []);

  const getPrice = (monthlyPrice: number) => {
    if (billingCycle === "yearly") {
      const yearlyPrice = monthlyPrice * 10;
      return `R$${yearlyPrice.toFixed(2)}/ano`;
    }
    return `R$${monthlyPrice.toFixed(2)}/mês`;
  };

  const handleSubscribe = async (planType: "essential" | "pro") => {
    if (useSubscription) {
      setIsLoading(planType);
      try {
        await handleCheckout(planType, billingCycle);
      } finally {
        setIsLoading(null);
      }
    } else {
      window.location.href = "/login?register=true";
    }
  };

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-24 bg-muted/50 relative"
      id="pricing"
    >
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="text-center mb-12">
          <h2 className="reveal text-3xl md:text-4xl font-bold mb-4">
            Escolha o plano ideal para você
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-8"></div>

          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 rounded-lg ${
                billingCycle === "monthly"
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 py-2 rounded-lg ${
                billingCycle === "yearly"
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              Anual
              <span className="ml-2 text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                -17%
              </span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-8 md:flex-row mx-auto max-w-3xl">
          <PricingTier
            name="Essencial"
            price={getPrice(19.9)}
            description="Simplicidade e eficiência para quem está começando."
            features={[
              "Encomendas ilimitadas",
              "Relatórios básicos",
              "Acesso via celular e computador",
              "Suporte por e-mail",
            ]}
            ctaText={useSubscription ? "Assinar Essencial" : "Começar agora"}
            delay="100ms"
            smallText="Ideal para autônomos e pequenos negócios que querem organização sem complicação."
            onSubscribe={() => handleSubscribe("essential")}
            isLoading={isLoading === "essential"}
          />

          <PricingTier
            name="Pro"
            price={getPrice(39.9)}
            description="Mais controle e recursos para negócios com equipe."
            features={[
              "Tudo do Essencial",
              "Cadastro de colaboradores",
              "Painel de produção",
              "Controle de acesso por papel",
              "Relatórios avançados",
              "Prioridade no suporte",
            ]}
            ctaText={useSubscription ? "Assinar Pro" : "Começar agora"}
            isPro
            delay="200ms"
            freeTrialDays={7}
            smallText="Perfeito para quem tem uma equipe ou lida com alto volume de pedidos."
            onSubscribe={() => handleSubscribe("pro")}
            isLoading={isLoading === "pro"}
          />
        </div>
      </div>

      {/* Background gradient */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-accent/10 rounded-full filter blur-[100px] -z-10"></div>
    </section>
  );
}
