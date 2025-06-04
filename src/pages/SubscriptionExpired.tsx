import { PricingSection } from "@/components/layout/PricingSection";
import { AlertCircle, Clock, CreditCard, Zap } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";

export function SubscriptionExpired() {
  const { subscription, isTrial, isPaymentFailed, isExpired } =
    useWorkspaceContext();

  // Determina o estado da assinatura e retorna as informações apropriadas
  const getSubscriptionState = () => {
    if (isTrial) {
      return {
        title: "Seu período de teste expirou",
        description:
          "Para continuar aproveitando todos os recursos da plataforma, escolha um dos planos abaixo.",
        icon: Clock,
        variant: "default" as const,
        previousPlan: null,
      };
    }

    if (isPaymentFailed) {
      return {
        title: "Erro no pagamento",
        description:
          "Ocorreu um erro no processamento do seu pagamento. Por favor, verifique seus dados e tente novamente.",
        icon: CreditCard,
        variant: "destructive" as const,
        previousPlan: subscription?.plan,
      };
    }

    if (isExpired) {
      return {
        title: "Sua assinatura expirou",
        description:
          "Para continuar utilizando todos os recursos da plataforma, renove sua assinatura escolhendo um dos planos abaixo.",
        icon: AlertCircle,
        variant: "destructive" as const,
        previousPlan: subscription?.plan,
      };
    }

    return {
      title: "Assinatura necessária",
      description:
        "Para acessar todos os recursos da plataforma, escolha um dos planos abaixo.",
      icon: Zap,
      variant: "default" as const,
      previousPlan: null,
    };
  };

  const state = getSubscriptionState();
  const Icon = state.icon;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Assinatura</h1>
          <p className="text-muted-foreground">
            Escolha o plano que melhor se adapta às suas necessidades
          </p>
        </div>

        {/* Alert */}
        <Alert variant={state.variant} className="mb-8">
          <Icon className="h-4 w-4" />
          <AlertTitle>{state.title}</AlertTitle>
          <AlertDescription>{state.description}</AlertDescription>
        </Alert>

        {/* Previous Plan Card */}
        {state.previousPlan && (
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle>Seu plano anterior</CardTitle>
              <CardDescription>
                Você estava no plano{" "}
                <span className="font-semibold capitalize">
                  {state.previousPlan}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link to="/dashboard">Voltar ao dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pricing Section */}
        <div className="mt-8">
          <PricingSection />
        </div>

        {/* Additional Info */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle>Precisa de ajuda?</CardTitle>
            <CardDescription>
              Entre em contato com nosso suporte para mais informações sobre os
              planos e recursos disponíveis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link to="/contact">Falar com suporte</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
