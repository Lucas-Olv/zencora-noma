import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useEffect, useRef } from "react";

interface PricingTierProps {
  name: string;
  price: string;
  features: string[];
  ctaText: string;
  isPro?: boolean;
  delay: string;
  freeTrialDays?: number;
}

function PricingTier({ name, price, features, ctaText, isPro = false, delay, freeTrialDays }: PricingTierProps) {
  return (
    <div 
      className={`reveal delay-[${delay}] relative rounded-2xl ${
        isPro ? "bg-gradient-to-b from-secondary to-primary border-0" : "bg-card border"
      } overflow-hidden`}
    >
      {isPro && (
        <div className="inset-px rounded-2xl border-2 border-primary bg-card z-10">
          <div className="h-full w-full p-6 md:p-8">
            <div className="mb-4">
              <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{name}</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold">{price}</span>
                {freeTrialDays && (
                  <div className="inline-block ml-2 bg-primary/10 text-primary text-sm font-medium px-2 py-0.5 rounded-full">
                    {freeTrialDays} dias grátis
                  </div>
                )}
              </div>
            </div>
            <ul className="mb-8 space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="h-5 w-5 mr-2 text-primary" />
                  <span className="text-foreground/80">{feature}</span>
                </li>
              ))}
            </ul>
            <Button className="w-full bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90">
              {ctaText}
            </Button>
          </div>
        </div>
      )}

      {!isPro && (
        <div className="h-full w-full p-6 md:p-8">
          <div className="mb-4">
            <h3 className="text-xl font-bold">{name}</h3>
            <div className="mt-2">
              <span className="text-3xl font-bold">{price}</span>
              {freeTrialDays && (
                <div className="inline-block ml-2 bg-primary/10 text-primary text-sm font-medium px-2 py-0.5 rounded-full">
                  {freeTrialDays} dias grátis
                </div>
              )}
            </div>
          </div>
          <ul className="mb-8 space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <Check className="h-5 w-5 mr-2 text-primary" />
                <span className="text-foreground/80">{feature}</span>
              </li>
            ))}
          </ul>
          <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white">
            {ctaText}
          </Button>
        </div>
      )}
    </div>
  );
}

export function PricingSection() {
  const sectionRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });
    
    const section = sectionRef.current;
    if (section) {
      const elements = section.querySelectorAll('.reveal');
      elements.forEach((el) => observer.observe(el));
    }
    
    return () => {
      if (section) {
        const elements = section.querySelectorAll('.reveal');
        elements.forEach((el) => observer.unobserve(el));
      }
    };
  }, []);

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
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto"></div>
        </div>
        
        <div className="flex flex-col gap-8 md:flex-row max-w-3xl mx-auto">
          <PricingTier 
            name="Básico" 
            price="R$19,90/mês" 
            features={[
              "Até 20 encomendas por mês",
              "1 colaborador",
              "Relatórios básicos",
              "Acesso ao painel de produção"
            ]}
            ctaText="Comece agora"
            delay="100ms"
            freeTrialDays={7}
          />
          
          <PricingTier 
            name="Pro" 
            price="R$39,90/mês" 
            features={[
              "Encomendas ilimitadas",
              "Colaboradores ilimitados",
              "Relatórios avançados",
              "Prioridade no suporte"
            ]}
            ctaText="Assinar Pro"
            isPro
            delay="200ms"
            freeTrialDays={7}
          />
        </div>
      </div>
      
      {/* Background gradient */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-accent/10 rounded-full filter blur-[100px] -z-10"></div>
    </section>
  );
}
