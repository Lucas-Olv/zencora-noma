import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useResizeAnimation } from "@/hooks/useResizeAnimation";

export function HeroSection() {
  const isMobile = useIsMobile();
  const sectionRef = useRef<HTMLElement>(null);
  const resizeRef = useResizeAnimation();
  
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
      className="relative pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden" 
      id="hero"
    >
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
          <div 
            ref={resizeRef as any}
            className={`w-full ${!isMobile ? 'md:w-1/2' : ''} text-center ${!isMobile ? 'md:text-left' : ''} transition-all duration-300 ease-in-out`}
          >
            <h1 className="reveal text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-primary via-secondary to-complementary bg-clip-text text-transparent">
              Gerencie suas encomendas com facilidade
            </h1>
            <p className="reveal text-lg md:text-xl text-foreground/80 mb-8 delay-[100ms]">
              O Noma é o aplicativo ideal para pequenos empreendedores que precisam de agilidade e organização no dia a dia.
            </p>
            <div className="reveal delay-[200ms]">
              <Button 
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg rounded-full transition-all duration-300 ease-in-out"
                asChild
              >
                <a href="#pricing">Comece grátis</a>
              </Button>
            </div>
          </div>
          
          {!isMobile && (
          <div 
          ref={resizeRef as any}
          className={`w-full md:w-1/2 reveal delay-[300ms] transition-all duration-300 ease-in-out`}
        >
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-30 transition-all duration-300 ease-in-out"></div>
            <div className="relative bg-card rounded-xl overflow-hidden border shadow-xl transition-all duration-300 ease-in-out">
              <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-6">
                <div className="w-full max-w-md bg-background/70 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-white/10 dark:border-white/5 transition-all duration-300 ease-in-out">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-8 w-32 bg-primary/20 rounded-md transition-all duration-300 ease-in-out"></div>
                    <div className="h-8 w-8 rounded-full bg-accent/20 transition-all duration-300 ease-in-out"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-muted rounded-full w-full transition-all duration-300 ease-in-out"></div>
                    <div className="h-3 bg-muted rounded-full w-5/6 transition-all duration-300 ease-in-out"></div>
                    <div className="h-3 bg-muted rounded-full w-4/6 transition-all duration-300 ease-in-out"></div>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="h-16 bg-primary/10 rounded-lg transition-all duration-300 ease-in-out"></div>
                    <div className="h-16 bg-secondary/10 rounded-lg transition-all duration-300 ease-in-out"></div>
                    <div className="h-16 bg-secondary/10 rounded-lg transition-all duration-300 ease-in-out"></div>
                    <div className="h-16 bg-primary/10 rounded-lg transition-all duration-300 ease-in-out"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
          )}
        </div>
      </div>

      {/* Background gradient */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/20 rounded-full filter blur-[100px] -z-10 transition-all duration-300 ease-in-out"></div>
    </section>
  );
}
