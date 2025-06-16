import { useState, FormEvent, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useSessionStore } from "@/storage/session";
import { verifyToken } from "@/lib/jwt";
import { Session } from "@/lib/types";
import { postCoreApiPublic } from "@/lib/apiHelpers";
import { useProductStore } from "@/storage/product";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";

export const LoginForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const { setSession } = useSessionStore();
  const { setIsAuthenticated } = useWorkspaceContext();

  const {
    mutate: register,
    error: registerError,
    data: registerData,
    isPending: isRegisterPending,
  } = useMutation({
    mutationFn: () =>
      postCoreApiPublic("/api/core/v1/signup", { email, password, name }),
    onSuccess: () => {
      toast({
        title: "Conta criada com sucesso",
        description: "Verifique seu email para confirmar sua conta.",
      });
      setActiveTab("login");
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar conta",
        description: getErrorMessage(error),
      });
      console.log(error);
    },
  });

  const {
    mutate: resetPassword,
    error: resetPasswordError,
    data: resetPasswordData,
    isPending: isResetPasswordPending,
  } = useMutation({
    mutationFn: () =>
      postCoreApiPublic("/api/core/v1/forgot-password", { email }),
    onSuccess: () => {
      toast({
        title: "Solicitação de recuperação enviada",
        description:
          "Sua solicitação para recuperação de senha foi enviada com sucesso. Verifique seu e-mail.",
      });
      setActiveTab("login");
      setShowResetPassword(false);
    },
    onError: (error) => {
      toast({
        title: "Erro ao solicitar recuperação de senha",
        description:
          "Ocorreu um erro ao solicitar a recuperação da senha, tente novamente.",
      });
      console.log(error);
    },
  });

  const {
    mutate: login,
    isPending: isLoginPending,
    error: loginError,
    data: loginData,
  } = useMutation({
    mutationFn: ({
      email,
      password,
      productId,
      sessionSystem,
    }: {
      email: string;
      password: string;
      productId: string;
      sessionSystem: string;
    }) =>
      postCoreApiPublic("/api/core/v1/signin", {
        email,
        password,
        productId,
        sessionSystem,
      }),
    onSuccess: async (response) => {
      try {
        const payload = await verifyToken(response.data.accessToken);
        const session: Session = {
          id: payload.sessionId as string,
          user: {
            id: payload.sub as string,
            name: payload.name as string,
            email: payload.email as string,
            sessionId: payload.sessionId as string,
          },
          token: response.data.accessToken,
          productId: payload.productId as string,
        };
        setSession(session, response.data.accessToken);
        setIsAuthenticated(true);
        toast({
          title: "Login realizado com sucesso",
          description: "Bem vindo de volta!",
        });
        navigate("/account");
      } catch (error) {
        console.error("Erro ao verificar token:", error);
        toast({
          title: "Erro ao verificar token",
          description: "Por favor, tente novamente.",
        });
      }
    },
    onError: (error) => {
      toast({ title: "Erro no login", description: getErrorMessage(error) });
    },
  });

  useEffect(() => {
    // Check if register=true is in the URL
    if (searchParams.get("register") === "true") {
      setActiveTab("register");
    }
  }, [searchParams]);

  const getErrorMessage = (error: any) => {
    const errorMessages: { [key: string]: string } = {
      "Invalid login credentials": "Credenciais de login inválidas",
      "Email not confirmed": "Email não confirmado",
      "User not found": "Usuário não encontrado",
      "Invalid email or password": "Email ou senha inválidos",
      "Email already registered": "Email já cadastrado",
      "Password should be at least 6 characters":
        "A senha deve ter pelo menos 6 caracteres",
      "Invalid email": "Email inválido",
    };

    return (
      errorMessages[error.message] ||
      error.message ||
      "Ocorreu um erro. Por favor, tente novamente."
    );
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    register();
  };

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    login({
      email,
      password,
      productId: useProductStore.getState().product.id.toString(),
      sessionSystem: getPlatform(),
    });
  };

  const getPlatform = (): string => {
    const platform = navigator.platform.toLowerCase();
    const userAgent = navigator.userAgent.toLowerCase();

    if (platform.includes("win")) return "Windows";
    if (platform.includes("mac")) return "macOS";
    if (platform.includes("linux")) return "Linux";
    if (/android/.test(userAgent)) return "Android";
    if (/iphone|ipad|ipod/.test(userAgent)) return "iOS";

    return "Unknown";
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    resetPassword();
  };

  const renderResetPasswordForm = () => (
    <Card className="w-full mt-4">
      <form onSubmit={handleResetPassword}>
        <CardHeader>
          <Button
            type="button"
            variant="ghost"
            className="w-fit p-0 hover:bg-transparent"
            onClick={() => setShowResetPassword(false)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <CardTitle>Recuperar Senha</CardTitle>
          <CardDescription>
            Digite seu email para receber as instruções de recuperação de senha.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email</Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="seu@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </CardContent>

        <CardFooter>
          <Button className="w-full" disabled={isResetPasswordPending}>
            {isResetPasswordPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar instruções"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-3xl font-bold text-center">Seja bem-vindo!</h2>
      {showResetPassword ? (
        renderResetPasswordForm()
      ) : (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full p-4"
        >
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
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    className="w-full text-sm text-muted-foreground hover:text-primary"
                    onClick={() => setShowResetPassword(true)}
                  >
                    Esqueceu sua senha?
                  </Button>
                </CardContent>

                <CardFooter>
                  <Button className="w-full" disabled={isLoginPending}>
                    {isLoginPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Entrando...
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
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button className="w-full" disabled={isRegisterPending}>
                    {isRegisterPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Criando conta...
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
      )}
    </div>
  );
};
