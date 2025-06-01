import { Link } from "react-router-dom";

export const Footer = () => {
  const handleFeatureClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const featuresSection = document.getElementById("features");
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handlePricingClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const featuresSection = document.getElementById("pricing");
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleFaqClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const featuresSection = document.getElementById("faq");
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="border-t py-8">
      <div className="container px-4">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="zencora-noma-logo.png"
                alt="Zencora Noma Logo"
                className="w-10 h-10"
              />
              <span className="font-bold text-xl">Zencora Noma</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Simplifique o gerenciamento de suas encomendas criativas
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Produto</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/#features"
                  onClick={handleFeatureClick}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Funcionalidades
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  onClick={handlePricingClick}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Preços
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  onClick={handleFaqClick}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Empresa</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/about"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sobre nós
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/privacy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacidade
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Termos
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© 2025 Zencora. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
