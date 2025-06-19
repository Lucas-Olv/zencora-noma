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

export default function PasswordVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // setLoading(true);

    // try {
    //   // Verify the current session password
    //   const { error } = await supabaseService.auth.verifyPassword(password);

    //   if (error) throw error;

    //   // Se for troca de papel, limpa a role atual antes de redirecionar
    //   if (fromRoleSwitch) {
    //     localStorage.removeItem("active_role_id");
    //   }

    //   // If password is correct, navigate to the target path with verified state
    //   navigate(targetPath, {
    //     replace: true,
    //     state: {
    //       ...location.state,
    //       verified: true,
    //     },
    //   });
    // } catch (error: any) {
    //   toast({
    //     title: "Erro na verificação",
    //     description: "Senha incorreta. Por favor, tente novamente.",
    //     variant: "destructive",
    //   });
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
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
              disabled={loading}
            >
              Voltar
            </Button>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
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
