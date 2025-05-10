import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Nav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleFeatureClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const handlePricingClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const featuresSection = document.getElementById('pricing');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };
  
  const handleFaqClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const featuresSection = document.getElementById('faq');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <img src="noma-logo.svg" alt="Zencora Noma Logo" className="w-10 h-10" />
            <span className="font-bold text-xl">Zencora Noma</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              to="/#features"
              onClick={handleFeatureClick}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Funcionalidades
            </Link>
            <Link to="/#pricing"
              onClick={handlePricingClick}
              className="text-muted-foreground hover:text-foreground transition-colors">
              Preços
            </Link>
            <Link to="/#faq"
              onClick={handleFaqClick}
              className="text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link to="/login">Começar grátis</Link>
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden border-t transition-all duration-300 ease-in-out",
          isMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        )}
      >
        <div className="container px-4 py-4 space-y-4">
          <nav className="flex flex-col gap-4">
            <Link
              to="/#features"
              onClick={handleFeatureClick}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Funcionalidades
            </Link>
            <Link
              to="/#pricing"
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={handlePricingClick}
            >
              Preços
            </Link>
            <Link
              to="/#faq"
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={handleFaqClick}
            >
              Preços
            </Link>
          </nav>
          <div className="flex flex-col gap-4 pt-4 border-t">
            <Button variant="ghost" asChild className="w-full justify-center">
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>Entrar</Link>
            </Button>
            <Button asChild className="w-full justify-center">
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>Começar grátis</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}; 