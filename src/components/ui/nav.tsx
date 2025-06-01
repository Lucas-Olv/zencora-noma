import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Nav = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Control body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
    closeMobileMenu();
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-200",
          isScrolled
            ? "bg-background/80 backdrop-blur-md shadow-sm"
            : "bg-transparent",
        )}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <img
              src="zencora-noma-logo.png"
              alt="Zencora Noma Logo"
              className="h-8 mr-2"
            />
            <Link to="/" className="text-2xl font-bold zencora-gradient-text">
              Zencora Noma
            </Link>
          </div>

          {/* Desktop Navigation */}
          <section className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              onClick={() => {
                setTimeout(() => {
                  const element = document.getElementById("hero");
                  if (element) {
                    const headerOffset = 80;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition =
                      elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                      top: offsetPosition,
                      behavior: "smooth",
                    });
                  }
                }, 100);
              }}
              className="font-medium hover:text-primary transition-colors"
            >
              Home
            </Link>
            <button
              onClick={() => scrollToSection("features")}
              className="font-medium hover:text-primary transition-colors"
            >
              Funcionalidades
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className="font-medium hover:text-primary transition-colors"
            >
              Preços
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="font-medium hover:text-primary transition-colors"
            >
              FAQ
            </button>
          </section>

          {/* Right side actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <Link to="/login">
              <Button
                variant="ghost"
                className="text-foreground hover:text-foreground hover:bg-muted transition-all duration-200 rounded-md"
              >
                Entrar
              </Button>
            </Link>
            <Link to="/login?register=true">
              <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
                Comece agora
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[99] bg-background/80 backdrop-blur-sm md:hidden"
            style={{ top: "73px" }}
            onClick={closeMobileMenu}
          />

          {/* Menu content */}
          <div className="fixed top-[70px] left-0 right-0 z-[100] bg-background shadow-lg md:hidden">
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              <Link
                to="/"
                onClick={() => {
                  closeMobileMenu();
                  setTimeout(() => {
                    const element = document.getElementById("hero");
                    if (element) {
                      const headerOffset = 80;
                      const elementPosition =
                        element.getBoundingClientRect().top;
                      const offsetPosition =
                        elementPosition + window.pageYOffset - headerOffset;

                      window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth",
                      });
                    }
                  }, 100);
                }}
                className="font-medium p-2 hover:bg-muted rounded-md text-left"
              >
                Home
              </Link>
              <button
                onClick={() => scrollToSection("features")}
                className="font-medium p-2 hover:bg-muted rounded-md text-left"
              >
                Funcionalidades
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="font-medium p-2 hover:bg-muted rounded-md text-left"
              >
                Preços
              </button>
              <button
                onClick={() => scrollToSection("faq")}
                className="font-medium p-2 hover:bg-muted rounded-md text-left"
              >
                FAQ
              </button>
              <div className="flex flex-col space-y-4">
                <Link to="/login" onClick={closeMobileMenu}>
                  <Button
                    variant="ghost"
                    className="w-full text-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-200 rounded-md"
                  >
                    Entrar
                  </Button>
                </Link>
                <Link to="/login?register=true" onClick={closeMobileMenu}>
                  <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
                    Comece agora
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
