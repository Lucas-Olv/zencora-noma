import { Nav } from "@/components/ui/nav";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const Privacy = () => {
  return (
    <div className="min-h-screen">
      <ScrollReveal>
        <header>
          <Nav />
        </header>
      </ScrollReveal>

      <main className="container mx-auto px-4 py-8">
        <ScrollReveal>
          <section>
            <h1 className="text-4xl font-bold mb-6">Política de Privacidade</h1>
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <ScrollReveal delay={100}>
                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">1. Coleta de Informações</h2>
                  <p className="text-foreground/80 mb-4">
                    A Zencora coleta informações que você nos fornece diretamente, como quando você cria uma conta, 
                    preenche formulários, utiliza nossos serviços, ou interage com nosso suporte ao cliente. Isso pode incluir:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                    <li>Informações de identificação pessoal (nome, e-mail, telefone)</li>
                    <li>Informações de pagamento e faturamento</li>
                    <li>Informações sobre sua empresa e atividades</li>
                    <li>Dados de uso e preferências dentro do aplicativo</li>
                  </ul>
                </section>
              </ScrollReveal>
              
              <ScrollReveal delay={200}>
                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">2. Uso das Informações</h2>
                  <p className="text-foreground/80 mb-4">
                    Utilizamos as informações coletadas para:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                    <li>Fornecer, manter e melhorar nossos serviços</li>
                    <li>Processar transações e enviar notificações relacionadas</li>
                    <li>Personalizar sua experiência e oferecer conteúdo relevante</li>
                    <li>Analisar tendências de uso e eficácia do serviço</li>
                    <li>Proteger contra atividades fraudulentas e não autorizadas</li>
                  </ul>
                </section>
              </ScrollReveal>
              
              <ScrollReveal delay={300}>
                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">3. Compartilhamento de Informações</h2>
                  <p className="text-foreground/80 mb-4">
                    A Zencora não vende, aluga ou compartilha suas informações pessoais com terceiros para fins de marketing. 
                    Podemos compartilhar suas informações nas seguintes circunstâncias:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                    <li>Com provedores de serviço que nos auxiliam na operação do negócio</li>
                    <li>Para cumprir com obrigações legais ou regulatórias</li>
                    <li>Quando necessário para proteger nossos direitos e propriedade</li>
                  </ul>
                </section>
              </ScrollReveal>
              
              <ScrollReveal delay={400}>
                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">4. Segurança</h2>
                  <p className="text-foreground/80">
                    Implementamos medidas técnicas e organizacionais para proteger suas informações contra acesso não autorizado, 
                    perda, alteração ou destruição. Contudo, nenhum método de transmissão pela internet ou armazenamento eletrônico é 
                    totalmente seguro, portanto não podemos garantir segurança absoluta.
                  </p>
                </section>
              </ScrollReveal>
              
              <ScrollReveal delay={500}>
                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">5. Seus Direitos</h2>
                  <p className="text-foreground/80 mb-4">
                    Você tem direitos em relação às suas informações pessoais, incluindo:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                    <li>Acesso às suas informações pessoais</li>
                    <li>Correção de dados imprecisos</li>
                    <li>Exclusão de seus dados em determinadas circunstâncias</li>
                    <li>Objeção ao processamento de seus dados</li>
                    <li>Portabilidade de dados para outro serviço</li>
                  </ul>
                </section>
              </ScrollReveal>
              
              <ScrollReveal delay={600}>
                <section>
                  <h2 className="text-2xl font-semibold mb-4">6. Contato</h2>
                  <p className="text-foreground/80">
                    Se você tiver dúvidas ou preocupações sobre nossa Política de Privacidade ou práticas de dados, 
                    entre em contato conosco pelo e-mail: <a href="mailto:privacidade@zencora.com" className="text-primary hover:underline">
                    privacidade@zencora.com</a>
                  </p>
                </section>
              </ScrollReveal>
            </div>
          </section>
        </ScrollReveal>
      </main>

      <ScrollReveal delay={700}>
        <footer>
          <Footer />
        </footer>
      </ScrollReveal>
    </div>
  );
};

export default Privacy;
