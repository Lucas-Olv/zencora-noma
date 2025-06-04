import { useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export function Footer() {
  const sectionRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string,
  ) => {
    if (path.startsWith("/#")) {
      if (location.pathname === "/") {
        e.preventDefault();
        const element = document.getElementById(path.substring(2));
        if (element) {
          const headerOffset = 80; // Altura do header fixo
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
        return;
      }
      return;
    }

    e.preventDefault();
    window.scrollTo(0, 0);
    navigate(path);
  };

  return (
    <footer ref={sectionRef} className="py-16 md:py-24 border-t">
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="col-span-1 md:col-span-1 reveal">
            <div className="flex flex-col gap-4 items-center md:items-start">
              <div className="flex items-center justify-center gap-2">
                <img
                  src="zencora-noma-logo.png"
                  alt="Zencora Noma Logo"
                  className="w-10 h-10 center"
                />
                <p className="text-2xl w-full text-center md:text-left font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Noma
                </p>
              </div>
              <p className="text-foreground/70 mb-4 max-w-md text-center md:text-left">
                Organize suas encomendas e aumente sua produtividade com o
                aplicativo perfeito para pequenos empreendedores.
              </p>
            </div>
          </div>
          <div className="flex flex-row justify-between col-span-1 items-center reveal px-8">
            <div className="reveal delay-[100ms] text-start md:text-left w-full">
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/#features"
                    onClick={(e) => handleLinkClick(e, "/#features")}
                    className="text-foreground/70 hover:text-primary"
                  >
                    Funcionalidades
                  </Link>
                </li>
                <li>
                  <Link
                    to="/#pricing"
                    onClick={(e) => handleLinkClick(e, "/#pricing")}
                    className="text-foreground/70 hover:text-primary"
                  >
                    Planos e Preços
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    onClick={(e) => handleLinkClick(e, "/about")}
                    className="text-foreground/70 hover:text-primary"
                  >
                    Sobre
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    onClick={(e) => handleLinkClick(e, "/contact")}
                    className="text-foreground/70 hover:text-primary"
                  >
                    Suporte
                  </Link>
                </li>
              </ul>
            </div>

            <div className="reveal delay-[200ms] text-end md:text-left w-full">
              <h4 className="font-semibold mb-4">Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/privacy"
                    onClick={(e) => handleLinkClick(e, "/privacy")}
                    className="text-foreground/70 hover:text-primary"
                  >
                    Privacidade
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    onClick={(e) => handleLinkClick(e, "/terms")}
                    className="text-foreground/70 hover:text-primary"
                  >
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    onClick={(e) => handleLinkClick(e, "/about")}
                    className="text-foreground/70 hover:text-primary"
                  >
                    Sobre a Zencora
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    onClick={(e) => handleLinkClick(e, "/contact")}
                    className="text-foreground/70 hover:text-primary"
                  >
                    Contato
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 reveal delay-[300ms]">
          <p className="text-center text-foreground/60 text-sm">
            © 2025 Zencora. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
