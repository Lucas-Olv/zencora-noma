import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";

export function SubscriptionSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const validateSession = async () => {
      if (!sessionId) {
        navigate("/");
        return;
      }

      try {
      } catch (error) {
        console.error("Erro ao validar sessão:", error);
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
  }, [sessionId, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-semibold mb-2">
            Processando sua assinatura
          </h2>
          <p className="text-muted-foreground">
            Aguarde enquanto validamos seu pagamento...
          </p>
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
          Obrigado por assinar o Noma! Sua assinatura foi ativada com sucesso e
          você já pode começar a usar todos os recursos disponíveis no seu
          plano.
        </p>
        <div className="space-y-4">
          <Button className="w-full" onClick={() => navigate("/dashboard")}>
            Ir para o Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
