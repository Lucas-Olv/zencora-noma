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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabaseService } from "@/services/supabaseService";
import { supabase } from "@/integrations/supabase/client";

const LoginForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  
  const getErrorMessage = (error: any) => {
    const errorMessages: { [key: string]: string } = {
      "Invalid login credentials": "Credenciais de login inválidas",
      "Email not confirmed": "Email não confirmado",
      "User not found": "Usuário não encontrado",
      "Invalid email or password": "Email ou senha inválidos",
      "Email already registered": "Email já cadastrado",
      "Password should be at least 6 characters": "A senha deve ter pelo menos 6 caracteres",
      "Invalid email": "Email inválido",
    };

    return errorMessages[error.message] || error.message || "Ocorreu um erro. Por favor, tente novamente.";
  };
  
  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Criar o usuário na autenticação
      const { data: authData, error: authError } = await supabaseService.auth.signUpWithEmail(email, password, { name });
      
      if (authError) throw authError;
      
      if (!authData.user) {
        throw new Error("Erro ao criar usuário na autenticação");
      }

      // Buscar o produto Noma
      console.log('Iniciando busca do produto Noma...');
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('code', 'noma')
        .single();
      
      console.log('Resultado da busca do produto:', { productData, productError });
      
      if (productError) {
        console.error('Erro ao buscar produto:', productError);
        throw productError;
      }
        
      if (!productData) {
        console.error('Produto Noma não encontrado');
        throw new Error("Produto Noma não encontrado");
      }

      console.log('Produto encontrado:', productData);

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 14); // 14 dias de trial
      
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: authData.user.id,
          product_id: productData.id,
          plan: 'free',
          status: 'trial',
          expires_at: expiryDate.toISOString()
        });

      if (subscriptionError) {
        console.error('Erro ao criar assinatura:', subscriptionError);
        throw subscriptionError;
      }
      
      // Verificar se o email precisa ser confirmado
      if (authData.session === null) {
        toast({
          title: "Conta criada com sucesso!",
          description: "Por favor, verifique seu email para confirmar sua conta antes de fazer login.",
        });
        setActiveTab("login");
        return;
      }
      
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo ao Zencora Noma.",
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Erro ao criar conta:", error);
      toast({
        title: "Erro ao criar conta",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data, error } = await supabaseService.auth.signInWithEmail(email, password);
      
      if (error) throw error;
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta ao Zencora Noma.",
      });
      
      navigate("/dashboard");
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
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md mx-auto">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Entrar</TabsTrigger>
        <TabsTrigger value="register">Criar Conta</TabsTrigger>
      </TabsList>
      
      <TabsContent value="login" className="flex items-start">
        <Card className="w-full">
          <form onSubmit={handleSignIn}>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Entre com sua conta Zencora para acessar o sistema.
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
      </TabsContent>
      
      <TabsContent value="register" className="flex items-start">
        <Card className="w-full">
          <form onSubmit={handleSignUp}>
            <CardHeader>
              <CardTitle>Criar Conta</CardTitle>
              <CardDescription>
                Crie uma conta para começar a usar o Zencora Noma.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">Nome</Label>
                <Input
                  id="register-name"
                  placeholder="Seu nome"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-password">Senha</Label>
                <div className="relative">
                  <Input
                    id="register-password"
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
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando conta...
                  </>
                ) : (
                  "Criar Conta"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default LoginForm;
