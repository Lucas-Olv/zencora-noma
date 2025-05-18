import { Nav } from "@/components/ui/nav";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const Terms = () => {
  return (
    <div className="min-h-screen">
      <Nav />

      <main className="container mx-auto px-4 py-24">
        <ScrollReveal>
          <section>
            <h1 className="text-4xl font-bold mb-6">Termos de Uso</h1>
          </section>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Aceitação dos Termos
            </h2>
            <p className="text-foreground/80 mb-4">
              Ao acessar ou usar o aplicativo Noma ("Serviço") da Zencora, você
              concorda em ficar vinculado a estes Termos de Uso. Se você não
              concordar com alguma parte destes termos, não poderá acessar o
              serviço.
            </p>
          </section>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <section>
            <h2 className="text-2xl font-semibold mb-4">Uso do Serviço</h2>
            <p className="text-foreground/80 mb-4">
              O Serviço é destinado apenas para uso legal e autorizado. Você
              concorda em não:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80 mb-4">
              <li>Violar leis ou regulamentos aplicáveis</li>
              <li>Infringir direitos de propriedade intelectual</li>
              <li>Transmitir malware ou outros códigos maliciosos</li>
              <li>Tentar acessar contas ou sistemas sem autorização</li>
              <li>Interferir com a funcionalidade do Serviço</li>
              <li>Realizar engenharia reversa do aplicativo</li>
            </ul>
          </section>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <section>
            <h2 className="text-2xl font-semibold mb-4">Contas de Usuário</h2>
            <p className="text-foreground/80 mb-4">
              Para usar determinadas funcionalidades do Serviço, você precisa
              criar uma conta. Você é responsável por manter a confidencialidade
              de suas credenciais de login e por todas as atividades que ocorrem
              em sua conta. A Zencora não se responsabiliza por perdas
              decorrentes do uso não autorizado da sua conta.
            </p>
          </section>
        </ScrollReveal>

        <ScrollReveal delay={400}>
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Pagamentos e Assinaturas
            </h2>
            <p className="text-foreground/80 mb-4">
              O Serviço oferece planos gratuitos e pagos. Para planos pagos:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80 mb-4">
              <li>
                Os pagamentos são processados por provedores de pagamento
                terceirizados
              </li>
              <li>
                As assinaturas são renovadas automaticamente, a menos que sejam
                canceladas antes da data de renovação
              </li>
              <li>
                Reembolsos são processados conforme nossa política de reembolso
              </li>
              <li>
                Os preços estão sujeitos a alterações, com aviso prévio aos
                usuários
              </li>
            </ul>
          </section>
        </ScrollReveal>

        <ScrollReveal delay={500}>
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Propriedade Intelectual
            </h2>
            <p className="text-foreground/80 mb-4">
              O Serviço e seu conteúdo original, incluindo texto, gráficos,
              logotipos, ícones e imagens, são propriedade da Zencora e estão
              protegidos por leis de direitos autorais. O uso não autorizado de
              qualquer material pode violar direitos autorais, marcas
              registradas e outras leis aplicáveis.
            </p>
          </section>
        </ScrollReveal>

        <ScrollReveal delay={600}>
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Limitação de Responsabilidade
            </h2>
            <p className="text-foreground/80 mb-4">
              A Zencora não será responsável por danos indiretos, incidentais,
              especiais, consequenciais ou punitivos, incluindo perda de lucros,
              dados, uso ou outros danos intangíveis, resultantes da sua
              utilização ou incapacidade de utilizar o Serviço.
            </p>
          </section>
        </ScrollReveal>

        <ScrollReveal delay={700}>
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Alterações aos Termos
            </h2>
            <p className="text-foreground/80 mb-4">
              A Zencora reserva-se o direito de modificar ou substituir estes
              Termos a qualquer momento. As alterações entrarão em vigor após
              serem publicadas no Serviço. O uso contínuo do Serviço após tais
              alterações constitui aceitação dos novos Termos.
            </p>
          </section>
        </ScrollReveal>
      </main>

      <ScrollReveal delay={800}>
        <footer>
          <Footer />
        </footer>
      </ScrollReveal>
    </div>
  );
};

export default Terms;
