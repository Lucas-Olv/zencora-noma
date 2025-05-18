import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabaseService } from "@/services/supabaseService";
import { useTenant } from "@/contexts/TenantContext";
import { useAuthContext } from "@/contexts/AuthContext";

const CollaboratorLoginForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const { login, isAuthenticated } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const getErrorMessage = (error: any) => {
    const errorMessages: { [key: string]: string } = {
      "Invalid login credentials": "Credenciais de login inválidas",
      "Email not confirmed": "Email não confirmado",
      "User not found": "Usuário não encontrado",
      "Invalid email or password": "Email ou senha inválidos",
    };

    return errorMessages[error.message] || error.message || "Ocorreu um erro. Por favor, tente novamente.";
  };
  
  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data, error } = await supabaseService.auth.signInWithEmail(email, password);
      
      if (error) throw error;
      
      if (data.session?.access_token) {
        login(data.session.access_token);
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta ao Zencora Noma.",
        });
        navigate("/collaborators/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full md:max-w-[20.5dvw] mx-auto">
      <h2 className="text-3xl font-bold text-center">
        Área do Colaborador
      </h2>
      
      <Card className="w-full mt-6">
        <form onSubmit={handleSignIn}>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Entre com sua conta de colaborador para acessar o sistema.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
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
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CollaboratorLoginForm; 