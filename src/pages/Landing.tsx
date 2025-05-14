import { useEffect } from "react";
import { Nav } from "@/components/ui/nav";
import { HeroSection } from "@/components/layout/HeroSection";
import { FeaturesSection } from "@/components/layout/FeaturesSection";
import { PricingSection } from "@/components/layout/PricingSection";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Faq } from "@/components/layout/Faq";
import { Cta } from "@/components/layout/Cta";

const Landing = () => {
  // Handle scrolling after page load
  useEffect(() => {
    // Check if we need to scroll to a specific section (coming from another page)
    const scrollToSection = sessionStorage.getItem('scrollToSection');
    
    if (scrollToSection) {
      // Clear the stored section to avoid scrolling on future page loads
      sessionStorage.removeItem('scrollToSection');
      
      // Small timeout to ensure the page is fully loaded
      setTimeout(() => {
        const targetElement = document.getElementById(scrollToSection);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80, // Offset for fixed header
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, []);

  return (
    <div className="min-h-screen">
      <Nav />

      <main>
        <ScrollReveal>
          <HeroSection />
        </ScrollReveal>

        <ScrollReveal delay={100}>
            <FeaturesSection />
        </ScrollReveal>

        <ScrollReveal delay={200}>
            <PricingSection />
        </ScrollReveal>

        <ScrollReveal delay={400}>
            <Faq />
        </ScrollReveal>

        <ScrollReveal delay={500}>
            <Cta />
        </ScrollReveal>
      </main>

      <ScrollReveal delay={600}>
          <Footer />
      </ScrollReveal>
    </div>
  );
};

export default Landing;
