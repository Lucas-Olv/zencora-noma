import { useSubscription } from "@/contexts/SubscriptionContext";
import { PricingSection } from "@/components/layout/PricingSection";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function SubscriptionExpired() {
  const { subscription } = useSubscription();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto mb-12">
        <Alert variant="destructive" className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Sua assinatura expirou</AlertTitle>
          <AlertDescription>
            Para continuar utilizando todos os recursos da plataforma, renove sua assinatura escolhendo um dos planos abaixo.
          </AlertDescription>
        </Alert>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Renove sua assinatura</h1>
          <p className="text-muted-foreground">
            Escolha o plano que melhor se adapta às suas necessidades e continue aproveitando todos os recursos da plataforma.
          </p>
        </div>

        {subscription?.plan && (
          <div className="bg-muted/50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-2">Seu plano anterior</h2>
            <p className="text-muted-foreground mb-4">
              Você estava no plano <strong>{subscription.plan}</strong>
            </p>
            <Button asChild variant="outline">
              <Link to="/dashboard">Voltar ao dashboard</Link>
            </Button>
          </div>
        )}
      </div>

      <PricingSection />
    </div>
  );
} 