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
import { useEffect } from "react";
import { useSubscriptionStorage } from "@/storage/subscription";
import dayjs from "dayjs";

export function SubscriptionExpired() {
  const { subscription } = useSubscriptionStorage();

  // Verifica periodicamente o status da assinatura
  useEffect(() => {}, [subscription]);

  // Determina o estado da assinatura e retorna as informações apropriadas
  const getSubscriptionState = () => {
    if (subscription?.isTrial) {
      return {
        title: "Seu período de teste expirou",
        description:
          "Para continuar aproveitando todos os recursos da plataforma, escolha um dos planos abaixo.",
        icon: Clock,
        variant: "default" as const,
        previousPlan: null,
      };
    }

    if (subscription?.status === "payment_failed") {
      return {
        title: "Erro no pagamento",
        description:
          "Ocorreu um erro no processamento do seu pagamento. Por favor, verifique seus dados e tente novamente.",
        icon: CreditCard,
        variant: "destructive" as const,
        previousPlan: subscription?.plan,
      };
    }

    if (dayjs(subscription?.expiresAt).isBefore(dayjs())) {
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
          </Card>
        )}

        {/* Pricing Section */}
        <div className="mt-8">
          <PricingSection useSubscription />
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
