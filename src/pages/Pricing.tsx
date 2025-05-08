import { Nav } from "@/components/ui/nav";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";

const PricingTier = ({
  name,
  price,
  description,
  features,
  highlighted = false,
  buttonText = "Começar agora",
  buttonLink = "/dashboard",
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  buttonText?: string;
  buttonLink?: string;
}) => (
  <div
    className={`flex flex-col p-4 md:p-6 rounded-2xl border shadow-sm ${
      highlighted
        ? "border-primary shadow-primary/10 relative overflow-visible"
        : "bg-card"
    }`}
  >
    {highlighted && (
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
        <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap">
          Mais popular
        </div>
      </div>
    )}
    <div className="mb-4">
      <h3 className="text-lg font-semibold">{name}</h3>
      <div className="mt-3 flex items-baseline">
        <span className="text-2xl md:text-3xl font-extrabold">{price}</span>
        {price !== "Grátis" && (
          <span className="ml-1 text-sm text-muted-foreground">/mês</span>
        )}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
    <ul className="mb-6 flex-grow space-y-2 text-sm">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center">
          <Check className="mr-2 h-4 w-4 text-primary" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
    <Button
      asChild
      className={highlighted ? "zencora-button" : ""}
      variant={highlighted ? "default" : "outline"}
      size="lg"
    >
      <Link to={buttonLink}>{buttonText}</Link>
    </Button>
  </div>
);

const Pricing = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <main className="flex-grow">
        <section className="py-12 md:py-16 lg:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold tracking-tighter">
                  Planos simples e{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                    transparentes
                  </span>
                </h2>
                <p className="max-w-[700px] text-sm md:text-base lg:text-xl text-muted-foreground mx-auto">
                  Escolha o plano ideal para o seu negócio. Todos os planos incluem acesso completo ao aplicativo.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 mt-8 md:mt-12 lg:mt-16">
              <PricingTier
                name="Pessoal"
                price="Grátis"
                description="Perfeito para empreendedores iniciantes."
                features={[
                  "Até 20 encomendas por mês",
                  "Cadastro de clientes básico",
                  "Acesso por 1 usuário",
                  "Relatórios básicos",
                  "Suporte por email",
                ]}
                buttonText="Comece grátis"
              />
              <PricingTier
                name="Profissional"
                price="R$39"
                description="Ideal para quem está crescendo."
                features={[
                  "Encomendas ilimitadas",
                  "Cadastro de clientes avançado",
                  "Acesso por até 3 usuários",
                  "Relatórios completos",
                  "Painel de produção",
                  "Histórico de clientes",
                  "Suporte prioritário",
                ]}
                highlighted={true}
                buttonText="Teste grátis por 7 dias"
              />
              <PricingTier
                name="Empresarial"
                price="R$79"
                description="Para negócios estabelecidos."
                features={[
                  "Tudo do Profissional",
                  "Acesso por até 10 usuários",
                  "Personalização de marca",
                  "Integração com calendário",
                  "API para integrações",
                  "Exportação de dados",
                  "Suporte prioritário 24/7",
                ]}
                buttonText="Fale com vendas"
                buttonLink="/contact"
              />
            </div>
            <div className="mt-8 md:mt-12 text-center">
              <p className="text-sm text-muted-foreground max-w-[600px] mx-auto">
                Todos os planos incluem a funcionalidade principal do Noma. Você pode fazer upgrade ou downgrade a qualquer momento.
                Precisa de um plano personalizado? <Link to="/contact" className="underline text-primary">Entre em contato</Link> conosco.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 md:py-16 bg-muted/30">
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
                <h3 className="text-xl font-semibold">Posso cancelar a qualquer momento?</h3>
                <p className="text-muted-foreground">
                  Sim, você pode cancelar sua assinatura a qualquer momento. Não há contratos de longo prazo.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Como funciona o teste gratuito?</h3>
                <p className="text-muted-foreground">
                  Você tem acesso a todas as funcionalidades do plano Profissional por 7 dias, sem compromisso.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Preciso de cartão de crédito para testar?</h3>
                <p className="text-muted-foreground">
                  Não, você pode começar seu teste gratuito sem fornecer dados de pagamento.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Posso mudar de plano depois?</h3>
                <p className="text-muted-foreground">
                  Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Como funcionam os usuários adicionais?</h3>
                <p className="text-muted-foreground">
                  Cada plano tem um limite de usuários que podem acessar sua conta. Usuários adicionais podem ser adicionados por uma taxa extra.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Oferem suporte em português?</h3>
                <p className="text-muted-foreground">
                  Sim, todo nosso suporte é em português, com atendimento por email e chat.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-12 md:py-16">
          <div className="container">
            <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 md:p-8 lg:p-12 text-primary-foreground text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Pronto para começar?
              </h2>
              <p className="text-base md:text-lg opacity-90 mb-6 max-w-2xl mx-auto">
                Experimente o Noma gratuitamente por 7 dias e descubra como é fácil organizar suas encomendas.
              </p>
              <Button size="lg" variant="secondary" asChild>
                <Link to="/dashboard">Comece grátis por 7 dias</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
