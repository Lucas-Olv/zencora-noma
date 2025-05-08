import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Nav } from "@/components/ui/nav";
import { Footer } from "@/components/ui/footer";
import {
  FileText,
  ChartBar,
  ListCheck,
  Users,
  Calendar,
  Moon,
} from "lucide-react";

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
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
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
                  {/* <Button size="lg" variant="outline">
                    <Link to="/features">Ver funcionalidades</Link>
                  </Button> */}
                </div>
              </div>
              <div className="rounded-lg overflow-hidden shadow-xl bg-gradient-to-br from-card to-secondary/5 p-4 md:p-6 relative h-[250px] sm:h-[300px] md:h-[400px]">
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
