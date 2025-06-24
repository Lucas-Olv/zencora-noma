import { useState, FormEvent, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { postCoreApi, postCoreApiPublic } from "@/lib/apiHelpers";

export default function PasswordVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Extrair os parâmetros do state com valores padrão
  const targetPath = location.state?.redirect || "/dashboard";
  const targetName = location.state?.name || "a página";
  const fromRoleSwitch = location.state?.fromRoleSwitch || false;

  useEffect(() => {
    // Se não houver state, redirecionar para o dashboard
    if (!location.state) {
      navigate("/dashboard", { replace: true });
    }
  }, [location.state, navigate, targetPath, targetName, fromRoleSwitch]);

  const handleBack = () => {
    navigate(-1);
  };

    const {
      mutate: verifyPassword,
      error: verifyPasswordError,
      isPending: isVerifyingPassword,
    } = useMutation({
      mutationFn: ({
      }: {

      }) =>
        postCoreApi(
          `/api/core/v1/verify-password`,
          {
            password,
          }
        ),
      onSuccess: () => {
      navigate(targetPath, {
        replace: true,
        state: {
          ...location.state,
          verified: true,
        },
      });
      },
      onError: (error) => {
      toast({
        title: "Erro na verificação",
        description: "Senha incorreta. Por favor, tente novamente.",
        variant: "destructive",
      });
        console.log(error);
      },
    });

    async function handleVerifyPassword(e: FormEvent) {
      e.preventDefault();
      verifyPassword({
        password,
      });
    }

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <Card className="w-full max-w-md">
        <form onSubmit={handleVerifyPassword}>
          <CardHeader>
            <CardTitle>Verificação de Senha</CardTitle>
            <CardDescription>
              Digite sua senha para acessar {targetName}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleBack}
              disabled={isVerifyingPassword}
            >
              Voltar
            </Button>
            <Button type="submit" className="w-full" disabled={isVerifyingPassword}>
              {isVerifyingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Verificando...
                </>
              ) : (
                "Acessar"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
