import { Nav } from "@/components/ui/nav";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const About = () => {
  return (
    <div className="min-h-screen">
      <Nav />

      <main className="container mx-auto px-4 py-24">
        <ScrollReveal>
          <section>
            <h1 className="text-4xl font-bold mb-6">Sobre a Zencora</h1>
          </section>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <section>
            <h2 className="text-2xl font-semibold mb-4">Nossa História</h2>
            <p className="text-foreground/80 mb-4">
              A Zencora nasceu da visão de transformar a maneira como as
              empresas gerenciam suas operações. Fundada em 2020, nossa empresa
              rapidamente se estabeleceu como líder em soluções de gestão
              empresarial, combinando tecnologia de ponta com um profundo
              entendimento das necessidades do mercado.
            </p>
            <p className="text-foreground/80 mb-8">
              Hoje, somos reconhecidos por nossa inovação constante e
              compromisso com a excelência, ajudando empresas de todos os portes
              a alcançarem seu potencial máximo através de nossas soluções
              tecnológicas.
            </p>
          </section>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <section>
            <h2 className="text-2xl font-semibold mb-4">Nossa Missão</h2>
            <p className="text-foreground/80 mb-4">
              Nossa missão é capacitar empresas através de tecnologia inovadora,
              fornecendo soluções que simplificam processos, aumentam a
              eficiência e impulsionam o crescimento sustentável.
            </p>
            <p className="text-foreground/80 mb-8">
              Acreditamos que cada empresa merece ter acesso a ferramentas de
              gestão de classe mundial, independentemente de seu tamanho ou
              setor.
            </p>
          </section>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Nossos Valores</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <ScrollReveal delay={400}>
                <div className="bg-background border rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-4">Inovação</h3>
                  <p className="text-foreground/80 mb-4">
                    Buscamos constantemente novas formas de resolver desafios e
                    melhorar nossas soluções.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={500}>
                <div className="bg-background border rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-4">Excelência</h3>
                  <p className="text-foreground/80 mb-4">
                    Comprometemo-nos com a mais alta qualidade em tudo o que
                    fazemos.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={600}>
                <div className="bg-background border rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-4">Integridade</h3>
                  <p className="text-foreground/80 mb-4">
                    Agimos com honestidade e transparência em todas as nossas
                    relações.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={700}>
                <div className="bg-background border rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-4">Colaboração</h3>
                  <p className="text-foreground/80 mb-4">
                    Valorizamos o trabalho em equipe e a cooperação para
                    alcançar objetivos comuns.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={800}>
                <div className="bg-background border rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-4">
                    Sustentabilidade
                  </h3>
                  <p className="text-foreground/80 mb-4">
                    Promovemos práticas sustentáveis e responsáveis em nossos
                    negócios.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={900}>
                <div className="bg-background border rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-4">
                    Foco no Cliente
                  </h3>
                  <p className="text-foreground/80 mb-4">
                    Colocamos as necessidades dos nossos clientes no centro de
                    nossas decisões.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal delay={1000}>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Nossa Equipe</h2>
            <p className="text-foreground/80 mb-8">
              Nossa equipe é composta por profissionais apaixonados e altamente
              qualificados, unidos pelo objetivo comum de transformar a gestão
              empresarial através da tecnologia.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <ScrollReveal delay={1100}>
                <div className="bg-background border rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-2">João Silva</h3>
                  <p className="text-foreground/60 mb-4">CEO & Fundador</p>
                  <p className="text-foreground/80 mb-4">
                    Mais de 15 anos de experiência em tecnologia e gestão
                    empresarial.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={1200}>
                <div className="bg-background border rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-2">Maria Santos</h3>
                  <p className="text-foreground/60 mb-4">CTO</p>
                  <p className="text-foreground/80 mb-4">
                    Especialista em arquitetura de software e inovação
                    tecnológica.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={1300}>
                <div className="bg-background border rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-2">Pedro Oliveira</h3>
                  <p className="text-foreground/60 mb-4">Diretor de Produto</p>
                  <p className="text-foreground/80 mb-4">
                    Focado em criar soluções que realmente atendam às
                    necessidades dos clientes.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </section>
        </ScrollReveal>
      </main>

      <ScrollReveal delay={1400}>
        <footer>
          <Footer />
        </footer>
      </ScrollReveal>
    </div>
  );
};

export default About;
