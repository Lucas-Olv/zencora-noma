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
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { postCoreApiPublic } from "@/lib/apiHelpers";
import { useSessionStorage } from "@/storage/session";
import { useProductStore } from "@/storage/product";
import { verifyToken } from "@/lib/jwt";
import { Session } from "@/lib/types";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { useAnalytics } from "@/contexts/AnalyticsProviderContext";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export const LoginForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [otp, setOtp] = useState("");
  const { setSession } = useSessionStorage();
  const { loadWorkspace } = useWorkspaceContext();
  const { trackEvent } = useAnalytics();

  const { mutate: requestAuthOtp, isPending: isRequestAuthPending } =
    useMutation({
      mutationFn: () =>
        postCoreApiPublic("/api/core/v1/signin", {
          email,
          productId: useProductStore.getState().product.id.toString(),
          sessionSystem: getPlatform(),
        }),
      onSuccess: () => {
        toast({
          title: "Código enviado",
          description: "Enviamos um código para seu email.",
        });
        setStep("otp");

        trackEvent("otp_request", {
          requestDate: new Date(),
        });
      },
      onError: (error) => {
        toast({
          title: "Erro ao enviar código",
          description: getErrorMessage(error),
          variant: "destructive",
        });
        console.log(error);
      },
    });

  const { mutate: verifyAuthOtp, isPending: isVerifyAuthPending } = useMutation(
    {
      mutationFn: () =>
        postCoreApiPublic("/api/core/v1/signin-with-otp", {
          email,
          otp,
          productId: useProductStore.getState().product.id.toString(),
          sessionSystem: getPlatform(),
        }),
      onSuccess: async (response) => {
        try {
          const session: Session = {
            id: response.data.sessionId as string,
            user: {
              id: response.data.sub as string,
              name: response.data.name as string,
              email: response.data.email as string,
              sessionId: response.data.sessionId as string,
            },
            productId: response.data.productId as string,
          };
          setSession(session);
          loadWorkspace();
          toast({
            title: "Autenticação realizada com sucesso",
            description: "Bem-vindo ao Zencora Noma!",
          });
          navigate("/");

          trackEvent("user_signin", {
            loginMethod: "otp",
          });
        } catch (error) {
          console.error("Erro ao verificar token:", error);
          toast({
            title: "Erro ao verificar token",
            description: "Por favor, tente novamente.",
            variant: "destructive",
          });
        }
      },
      onError: (error) => {
        toast({
          title: "Código inválido",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      },
    },
  );

  const handleRequestCode = (e: FormEvent) => {
    e.preventDefault();
    requestAuthOtp();
  };

  const handleVerifyCode = (e: FormEvent) => {
    e.preventDefault();
    verifyAuthOtp();
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

  const getErrorMessage = (error: any) => {
    const errorMessages: { [key: string]: string } = {
      "Invalid login credentials": "Credenciais de login inválidas",
      "Email not confirmed": "Email não confirmado",
      "User not found": "Usuário não encontrado",
      "Invalid email or password": "Email ou senha inválidos",
      "Email already registered": "Email já cadastrado",
      "Invalid email": "Email inválido",
      "Invalid OTP": "Código inválido",
      "OTP expired": "Código expirado",
    };

    return (
      errorMessages[error.message] ||
      error.message ||
      "Ocorreu um erro. Por favor, tente novamente."
    );
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-3xl font-bold text-center mb-6">Seja bem-vindo!</h2>
      <Card className="w-full">
        <form
          onSubmit={step === "email" ? handleRequestCode : handleVerifyCode}
        >
          <CardHeader>
            <CardTitle>Entrar no Zencora</CardTitle>
            <CardDescription>
              Digite seu email para receber um código de acesso.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {step === "email" && (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  disabled={isRequestAuthPending}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            )}

            {step === "otp" && (
              <div className="space-y-2">
                <Label htmlFor="otp">Código de acesso</Label>
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  containerClassName="w-full justify-between"
                  disabled={isVerifyAuthPending}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            )}
          </CardContent>

          <CardFooter>
            {step === "email" ? (
              <div className="w-full space-y-4">
                <Button className="w-full" disabled={isRequestAuthPending}>
                  {isRequestAuthPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando código...
                    </>
                  ) : (
                    "Enviar código de acesso"
                  )}
                </Button>
                <div className="flex items-center gap-2">
                  <div className="h-px bg-border w-full" />
                  <span className="text-xs text-muted-foreground">ou</span>
                  <div className="h-px bg-border w-full" />
                </div>
                <Button type="button" variant="outline" className="w-full">
                  Continuar com Google
                </Button>
              </div>
            ) : (
              <Button
                className="w-full"
                disabled={isVerifyAuthPending || otp.length !== 6}
              >
                {isVerifyAuthPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
