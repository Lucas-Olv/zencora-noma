import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Nav } from "@/components/ui/nav";
import { Footer } from "@/components/ui/footer";
import { Check } from "lucide-react";

import {
  FileText,
  ChartBar,
  ListCheck,
  Users,
  Calendar,
  Moon,
} from "lucide-react";

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
    className={`flex flex-col p-4 md:p-6 rounded-2xl border shadow-sm ${highlighted
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


const Landing = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-12 md:py-20 px-4">
          <div className="container">
            <div className="grid gap-8 md:grid-cols-2 items-center">
              <div className="space-y-4 md:space-y-6">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                  Organize suas encomendas de forma{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-complementary">
                    simples e eficiente
                  </span>
                </h1>
                <p className="text-base md:text-xl text-muted-foreground">
                  O Noma foi criado especialmente para pequenos empreendedores que trabalham com encomendas.
                  Sem complicações, apenas o que você realmente precisa.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" asChild className="zencora-button">
                    <Link to="/dashboard">Comece grátis por 7 dias</Link>
                  </Button>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden shadow-xl bg-gradient-to-br from-card to-secondary/5 p-4 md:p-6 relative h-[25dvh] sm:h-[30dvh] md:h-[40dvh]">
                <svg className="w-full h-full" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
                  {/* Background shapes */}
                  <rect x="10" y="20" width="380" height="200" rx="8" fill="#f3f4f6" opacity="0.4" />

                  {/* Dashboard header */}
                  <rect x="20" y="30" width="360" height="40" rx="4" fill="#8C52FF" opacity="0.8" />
                  <circle cx="40" cy="50" r="8" fill="white" />
                  <rect x="60" y="46" width="100" height="8" rx="4" fill="white" opacity="0.8" />

                  {/* Content columns */}
                  <rect x="20" y="80" width="150" height="130" rx="4" fill="#5170FF" opacity="0.6" />
                  <rect x="180" y="80" width="200" height="60" rx="4" fill="#FF66C4" opacity="0.5" />
                  <rect x="180" y="150" width="200" height="60" rx="4" fill="#8C52FF" opacity="0.5" />

                  {/* Data representation */}
                  <circle cx="50" cy="110" r="15" fill="white" opacity="0.8" />
                  <rect x="80" y="100" width="70" height="8" rx="4" fill="white" opacity="0.6" />
                  <rect x="80" y="115" width="50" height="8" rx="4" fill="white" opacity="0.8" />

                  <circle cx="50" cy="160" r="15" fill="white" opacity="0.8" />
                  <rect x="80" y="150" width="70" height="8" rx="4" fill="white" opacity="0.6" />
                  <rect x="80" y="165" width="50" height="8" rx="4" fill="white" opacity="0.8" />

                  {/* Data items in columns */}
                  <rect x="200" y="95" width="160" height="10" rx="4" fill="white" opacity="0.7" />
                  <rect x="200" y="115" width="120" height="10" rx="4" fill="white" opacity="0.7" />

                  <rect x="200" y="165" width="160" height="10" rx="4" fill="white" opacity="0.7" />
                  <rect x="200" y="185" width="120" height="10" rx="4" fill="white" opacity="0.7" />

                  {/* Decorative elements */}
                  <circle cx="370" cy="50" r="8" fill="white" opacity="0.6" />
                  <circle cx="345" cy="50" r="8" fill="white" opacity="0.6" />
                  <circle cx="320" cy="50" r="8" fill="white" opacity="0.6" />
                </svg>

                {/* Animated dots */}
                <div className="absolute top-12 right-12 w-3 h-3 rounded-full bg-zencora-purple animate-ping"></div>
                <div className="absolute bottom-16 left-10 w-2 h-2 rounded-full bg-zencora-pink animate-pulse"></div>
                <div className="absolute top-1/2 right-1/4 w-4 h-4 rounded-full bg-zencora-blue animate-bounce"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-12 md:py-16 bg-muted/30">
          <div className="container">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold">Funcionalidades Principais</h2>
              <p className="text-muted-foreground mt-2 text-sm md:text-base">
                Tudo o que você precisa, nada do que você não precisa.
              </p>
            </div>

            <div className="grid gap-4 sm:gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 rounded-full bg-primary/20 grid place-items-center text-primary mb-4">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-medium mb-2">Cadastro de encomendas</h3>
                <p className="text-muted-foreground">
                  Registre facilmente o nome do cliente, valor, data de entrega e descrição do pedido.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 rounded-full bg-primary/20 grid place-items-center text-primary mb-4">
                  <ChartBar className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-medium mb-2">Relatórios simples</h3>
                <p className="text-muted-foreground">
                  Visualize o total de pedidos e valores por período para controle financeiro.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 rounded-full bg-primary/20 grid place-items-center text-primary mb-4">
                  <ListCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-medium mb-2">Painel de produção</h3>
                <p className="text-muted-foreground">
                  Permita que colaboradores marquem as tarefas como "pronto" para melhorar o fluxo de trabalho.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 rounded-full bg-primary/20 grid place-items-center text-primary mb-4">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-medium mb-2">Acesso multi-usuário</h3>
                <p className="text-muted-foreground">
                  Permita que sua equipe acesse e colabore no mesmo espaço de trabalho.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 rounded-full bg-primary/20 grid place-items-center text-primary mb-4">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-medium mb-2">Calendário de entregas</h3>
                <p className="text-muted-foreground">
                  Visualize todas as entregas programadas em um calendário intuitivo.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 rounded-full bg-primary/20 grid place-items-center text-primary mb-4">
                  <Moon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-medium mb-2">Modo escuro</h3>
                <p className="text-muted-foreground">
                  Alterne entre o modo claro e escuro para uma experiência visual confortável.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-12 md:py-16 lg:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold tracking-tighter">
                  Planos simples e{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-complementary">
                    transparentes
                  </span>
                </h2>
                <p className="max-w-[700px] text-sm md:text-base lg:text-xl text-muted-foreground mx-auto">
                  Escolha o plano ideal para o seu negócio. Todos os planos incluem acesso completo ao aplicativo.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-2 mt-8 md:mt-12 lg:mt-16">
              <PricingTier
                name="Essencial"
                price="R$19,90"
                description="Ideal para autônomos e pequenos negócios que querem organização sem complicação."
                features={[
                  "Encomendas ilimitadas",
                  "Relatórios básicos",
                  "Acesso via celular e computador",
                  "Suporte por e-mail",
                ]}
                buttonText="Comece agora"
              />
              <PricingTier
                name="Profissional"
                price="R$39,90"
                description="Perfeito para quem tem uma equipe ou lida com alto volume de pedidos."
                features={[
                  "Tudo do Essencial",
                  "Painel de produção para colaboradores",
                  "Acesso por até 3 usuários",
                  "Relatórios avançados",
                  " Suporte prioritário via WhatsApp",
                ]}
                highlighted={true}
                buttonText="Teste grátis por 7 dias"
              />
              {/* <PricingTier
                name="Enterprise"
                price="Preço sob consulta"
                description="Um sistema sob medida para empresas que querem total controle."
                features={[
                  "Implantação personalizada",
                  "Hospedagem dedicada ou domínio próprio",
                  "Customização visual e estrutural completa",
                  "Exportação de dados",
                  "Suporte prioritário 24/7",
                ]}
                buttonText="Fale com vendas"
                buttonLink="/contact"
              /> */}
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
        <section id="faq" className="py-12 md:py-16 bg-muted/30">
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
                <h3 className="text-xl font-semibold">Oferecemos suporte em português?</h3>
                <p className="text-muted-foreground">
                  Sim, todo nosso suporte é em português, com atendimento por email e chat.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-20">
          <div className="container">
            <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 md:p-8 lg:p-12 text-primary-foreground text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Pronto para organizar suas encomendas?
              </h2>
              <p className="text-base md:text-lg opacity-90 mb-6 max-w-2xl mx-auto">
                Comece a usar o Noma hoje mesmo e tenha 7 dias gratuitos para experimentar todas as funcionalidades.
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

export default Landing;
