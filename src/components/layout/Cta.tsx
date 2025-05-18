import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useResizeAnimation } from "@/hooks/useResizeAnimation";
import { Link } from "react-router-dom";

export function Cta() {
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
    <section id="cta" className="py-16 md:py-24">
      <div className="container">
        <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 md:p-8 lg:p-12 text-primary-foreground text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Pronto para organizar suas encomendas?
          </h2>
          <p className="text-base md:text-lg opacity-90 mb-6 max-w-2xl mx-auto">
            Comece a usar o Noma hoje mesmo e tenha 7 dias gratuitos para
            experimentar todas as funcionalidades.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/login?register=true">Comece grátis por 7 dias</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
