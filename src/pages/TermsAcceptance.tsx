import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { useToast } from "@/components/ui/use-toast";
import { supabaseService } from "@/services/supabaseService";
import { db } from "@/lib/db";

const TermsAcceptance = () => {
  const [accepted, setAccepted] = useState(false);
  const { tenant, setTenant } = useWorkspaceContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAccept = async () => {
    if (!tenant) return;

    try {
      const { data, error } = await supabaseService.tenants.updateTenant(
        tenant.id,
        {
          user_accepted_terms: true,
        },
      );

      if (error) throw error;

      // Atualiza o tenant no IndexedDB
      await db.updateTenantData(data);

      setTenant(data);
      toast({
        title: "Termos aceitos",
        description: "Obrigado por aceitar os termos de uso.",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <ScrollReveal>
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">Termos de Uso</h1>
            <p className="text-muted-foreground">
              Por favor, leia e aceite os termos de uso para continuar
            </p>
          </div>
        </ScrollReveal>

        <Card>
          <CardHeader>
            <CardTitle>Termos de Uso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-sm max-w-none">
              <h2 className="text-2xl font-semibold mb-4">
                Aceitação dos Termos
              </h2>
              <p className="text-foreground/80 mb-4">
                Ao acessar ou usar o aplicativo Noma ("Serviço") da Zencora,
                você concorda em ficar vinculado a estes Termos de Uso. Se você
                não concordar com alguma parte destes termos, não poderá acessar
                o serviço.
              </p>

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

              <h2 className="text-2xl font-semibold mb-4">Contas de Usuário</h2>
              <p className="text-foreground/80 mb-4">
                Para usar determinadas funcionalidades do Serviço, você precisa
                criar uma conta. Você é responsável por manter a
                confidencialidade de suas credenciais de login e por todas as
                atividades que ocorrem em sua conta. A Zencora não se
                responsabiliza por perdas decorrentes do uso não autorizado da
                sua conta.
              </p>

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
                  As assinaturas são renovadas automaticamente, a menos que
                  sejam canceladas antes da data de renovação
                </li>
                <li>
                  Reembolsos são processados conforme nossa política de
                  reembolso
                </li>
                <li>
                  Os preços estão sujeitos a alterações, com aviso prévio aos
                  usuários
                </li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4">
                Propriedade Intelectual
              </h2>
              <p className="text-foreground/80 mb-4">
                O Serviço e seu conteúdo original, incluindo texto, gráficos,
                logotipos, ícones e imagens, são propriedade da Zencora e estão
                protegidos por leis de direitos autorais. O uso não autorizado
                de qualquer material pode violar direitos autorais, marcas
                registradas e outras leis aplicáveis.
              </p>

              <h2 className="text-2xl font-semibold mb-4">
                Limitação de Responsabilidade
              </h2>
              <p className="text-foreground/80 mb-4">
                A Zencora não será responsável por danos indiretos, incidentais,
                especiais, consequenciais ou punitivos, incluindo perda de
                lucros, dados, uso ou outros danos intangíveis, resultantes da
                sua utilização ou incapacidade de utilizar o Serviço.
              </p>

              <h2 className="text-2xl font-semibold mb-4">
                Alterações aos Termos
              </h2>
              <p className="text-foreground/80 mb-4">
                A Zencora reserva-se o direito de modificar ou substituir estes
                Termos a qualquer momento. As alterações entrarão em vigor após
                serem publicadas no Serviço. O uso contínuo do Serviço após tais
                alterações constitui aceitação dos novos Termos.
              </p>
            </div>

            <div className="flex items-center space-x-2 pt-4 border-t">
              <Checkbox
                id="terms"
                checked={accepted}
                onCheckedChange={(checked) => setAccepted(checked as boolean)}
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Eu li e concordo com os termos de uso
              </label>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleAccept} disabled={!accepted}>
                Aceitar e Continuar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsAcceptance;
