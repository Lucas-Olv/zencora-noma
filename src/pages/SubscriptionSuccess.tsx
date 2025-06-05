import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function SubscriptionSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { reloadSettings } = useWorkspaceContext();
  const [isLoading, setIsLoading] = useState(true);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const validateSession = async () => {
      if (!sessionId) {
        toast({
          title: "Erro",
          description: "Sessão de pagamento não encontrada.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      try {
        // Aqui você pode adicionar uma chamada para validar a sessão com o backend
        // const response = await fetch(`${import.meta.env.VITE_ZENCORA_PAYMENT_API_URL}/checkout/validate-session`, {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({ sessionId }),
        // });

        // if (!response.ok) {
        //   throw new Error("Falha ao validar sessão");
        // }

        // Recarrega as configurações para atualizar o estado da assinatura
        await reloadSettings();
        
        toast({
          title: "Sucesso!",
          description: "Sua assinatura foi ativada com sucesso.",
        });
      } catch (error) {
        console.error("Erro ao validar sessão:", error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao validar sua assinatura. Por favor, entre em contato com o suporte.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
  }, [sessionId, navigate, toast, reloadSettings]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-semibold mb-2">Processando sua assinatura</h2>
          <p className="text-muted-foreground">Aguarde enquanto validamos seu pagamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Assinatura Ativada!</h1>
        <p className="text-muted-foreground mb-8">
          Obrigado por assinar o Noma! Sua assinatura foi ativada com sucesso e você já pode começar a usar todos os recursos disponíveis no seu plano.
        </p>
        <div className="space-y-4">
          <Button
            className="w-full"
            onClick={() => navigate("/dashboard")}
          >
            Ir para o Dashboard
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/settings")}
          >
            Configurar Workspace
          </Button>
        </div>
      </div>
    </div>
  );
} 