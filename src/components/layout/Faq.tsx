import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useResizeAnimation } from "@/hooks/useResizeAnimation";

export function Faq() {
  const isMobile = useIsMobile();
  const sectionRef = useRef<HTMLElement>(null);
  const resizeRef = useResizeAnimation();

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

  return (
    <section id="faq" className="py-16 md:py-24 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter">
              Perguntas frequentes
            </h2>
            <p className="max-w-[700px] text-sm md:text-base text-muted-foreground mx-auto">
              Tire suas dúvidas sobre o Noma e nossos planos.
            </p>
          </div>
        </div>
        <div className="grid gap-6 md:gap-8 mx-auto mt-8 md:mt-12 md:grid-cols-2 max-w-4xl">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">
              Posso cancelar a qualquer momento?
            </h3>
            <p className="text-muted-foreground">
              Sim, você pode cancelar sua assinatura a qualquer momento. Não há
              contratos de longo prazo.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">
              Como funciona o teste gratuito?
            </h3>
            <p className="text-muted-foreground">
              Você tem acesso a todas as funcionalidades do plano Profissional
              por 7 dias, sem compromisso.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">
              Preciso de cartão de crédito para testar?
            </h3>
            <p className="text-muted-foreground">
              Não, você pode começar seu teste gratuito sem fornecer dados de
              pagamento.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">
              Posso mudar de plano depois?
            </h3>
            <p className="text-muted-foreground">
              Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer
              momento.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">
              Como funcionam os usuários adicionais?
            </h3>
            <p className="text-muted-foreground">
              Cada plano tem um limite de usuários que podem acessar sua conta.
              Usuários adicionais podem ser adicionados por uma taxa extra.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">
              Oferecemos suporte em português?
            </h3>
            <p className="text-muted-foreground">
              Sim, todo nosso suporte é em português, com atendimento por email
              e chat.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
