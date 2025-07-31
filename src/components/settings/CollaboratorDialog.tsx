import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { useToast } from "@/components/ui/use-toast";
import { Collaborator } from "@/lib/types";
import { RefreshCw, Eye, EyeOff } from "lucide-react";

// Schema base para validação do formulário
const baseSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  canAccessReports: z.boolean(),
  canAccessCalendar: z.boolean(),
  canAccessProduction: z.boolean(),
  canAccessOrders: z.boolean(),
  canAccessReminders: z.boolean(),
  canAccessSettings: z.boolean(),
  canAccessDashboard: z.boolean(),
  canAccessDelivery: z.boolean(),
  canCreateOrders: z.boolean(),
  canDeleteOrders: z.boolean(),
  canEditOrders: z.boolean(),
});

// Schema para criação (senha obrigatória)
const createSchema = baseSchema.extend({
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
});

// Schema para edição (senha opcional)
const editSchema = baseSchema.extend({
  password: z.string().optional(),
});

type CollaboratorFormData = z.infer<typeof createSchema>;

// Tipo para os dados do formulário sem campos obrigatórios do backend
type CollaboratorFormDataWithoutBackendFields = Omit<
  CollaboratorFormData,
  | "id"
  | "tenantId"
  | "invitedByUserId"
  | "lastLoginAt"
  | "createdAt"
  | "updatedAt"
>;

// Tipo para dados do formulário com senha opcional
type CollaboratorFormDataWithOptionalPassword = Omit<
  CollaboratorFormDataWithoutBackendFields,
  "password"
> & {
  password?: string;
};

interface CollaboratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  collaborator?: Collaborator;
  onSubmit: (data: CollaboratorFormDataWithOptionalPassword) => void;
  isPending: boolean;
}

export default function CollaboratorDialog({
  open,
  onOpenChange,
  mode,
  collaborator,
  onSubmit,
  isPending,
}: CollaboratorDialogProps) {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

  const form = useForm<CollaboratorFormData>({
    resolver: zodResolver(mode === "create" ? createSchema : editSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      canAccessReports: false,
      canAccessCalendar: false,
      canAccessProduction: false,
      canAccessOrders: false,
      canAccessReminders: false,
      canAccessSettings: false,
      canAccessDashboard: false,
      canAccessDelivery: false,
      canCreateOrders: false,
      canDeleteOrders: false,
      canEditOrders: false,
    },
  });

  // Resetar activeTab quando o modal abrir ou modo mudar
  useEffect(() => {
    setActiveTab("info");
  }, [open, mode]);

  // Resetar formulário quando o colaborador ou modo mudar
  useEffect(() => {
    if (collaborator && mode === "edit") {
      form.reset({
        name: collaborator.name || "",
        email: collaborator.email || "",
        password: "", // Sempre vazio no modo de edição
        canAccessReports: collaborator.canAccessReports || false,
        canAccessCalendar: collaborator.canAccessCalendar || false,
        canAccessProduction: collaborator.canAccessProduction || false,
        canAccessOrders: collaborator.canAccessOrders || false,
        canAccessReminders: collaborator.canAccessReminders || false,
        canAccessSettings: collaborator.canAccessSettings || false,
        canAccessDashboard: collaborator.canAccessDashboard || false,
        canAccessDelivery: collaborator.canAccessDelivery || false,
        canCreateOrders: collaborator.canCreateOrders || false,
        canDeleteOrders: collaborator.canDeleteOrders || false,
        canEditOrders: collaborator.canEditOrders || false,
      });
    } else if (mode === "create") {
      form.reset({
        name: "",
        email: "",
        password: "",
        canAccessReports: false,
        canAccessCalendar: false,
        canAccessProduction: false,
        canAccessOrders: false,
        canAccessReminders: false,
        canAccessSettings: false,
        canAccessDashboard: false,
        canAccessDelivery: false,
        canCreateOrders: false,
        canDeleteOrders: false,
        canEditOrders: false,
      });
    }
  }, [collaborator, mode, form]);

  // Gerar senha automática
  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setValue("password", password);
    toast({
      title: "Senha gerada",
      description: "Uma nova senha foi gerada automaticamente.",
    });
  };

  const handleSubmit = (data: CollaboratorFormData) => {
    // No modo de edição, se a senha estiver vazia, remover do objeto
    if (mode === "edit" && !data.password) {
      const { password, ...dataWithoutPassword } = data;
      onSubmit(dataWithoutPassword);
    } else if (mode === "create" && !data.password) {
      // No modo de criação, a senha é obrigatória
      toast({
        title: "Senha obrigatória",
        description: "A senha é obrigatória para criar um novo colaborador.",
        variant: "destructive",
      });
      return;
    } else {
      onSubmit(data);
    }
  };

  const handleNext = async () => {
    const fieldsToValidate: (keyof CollaboratorFormData)[] = ["name", "email"];
    if (mode === "create") {
      fieldsToValidate.push("password");
    }

    const isValid = await form.trigger(fieldsToValidate);

    if (isValid) {
      setActiveTab("permissions");
    }
  };

  const handleBack = () => {
    setActiveTab("info");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-2">
          <DialogTitle>
            {mode === "create" ? "Novo Colaborador" : "Editar Colaborador"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {mode === "create" ? (
              <div className="space-y-6">
                {/* Steps Indicator */}
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        activeTab === "info"
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      1
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        activeTab === "info"
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      Informações
                    </span>
                  </div>
                  <div className="w-8 h-px bg-border"></div>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        activeTab === "permissions"
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      2
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        activeTab === "permissions"
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      Permissões
                    </span>
                  </div>
                </div>

                {/* Step Content */}
                {activeTab === "info" ? (
                  <div className="space-y-4">
                    {/* <div className="text-center mb-6">
                      <h3 className="text-lg font-medium">Informações do Colaborador</h3>
                      <p className="text-sm text-muted-foreground">
                        Preencha os dados básicos do novo colaborador
                      </p>
                    </div> */}

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Nome do colaborador"
                              disabled={isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="email@exemplo.com"
                              disabled={isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type={showPassword ? "text" : "password"}
                                placeholder="Senha do colaborador"
                                required
                                disabled={isPending}
                              />
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="h-8 w-8"
                                  disabled={isPending}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={generatePassword}
                                  className="h-8 w-8"
                                  disabled={isPending}
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* <div className="text-center mb-6">
                      <h3 className="text-lg font-medium">Permissões de Acesso</h3>
                      <p className="text-sm text-muted-foreground">
                        Defina quais áreas do sistema o colaborador pode acessar
                      </p>
                    </div> */}

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="canAccessDashboard"
                        render={({ field }) => (
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Dashboard</Label>
                              <p className="text-sm text-muted-foreground">
                                Acesso ao painel principal
                              </p>
                            </div>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </div>
                        )}
                      />

                      <Separator />

                      <FormField
                        control={form.control}
                        name="canAccessOrders"
                        render={({ field }) => (
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Encomendas</Label>
                              <p className="text-sm text-muted-foreground">
                                Visualizar encomendas
                              </p>
                            </div>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </div>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="canCreateOrders"
                        render={({ field }) => (
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-muted-foreground">
                                Criar encomendas
                              </Label>
                            </div>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </div>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="canEditOrders"
                        render={({ field }) => (
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-muted-foreground">
                                Editar encomendas
                              </Label>
                            </div>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </div>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="canDeleteOrders"
                        render={({ field }) => (
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-muted-foreground">
                                Excluir encomendas
                              </Label>
                            </div>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </div>
                        )}
                      />

                      <Separator />

                      <FormField
                        control={form.control}
                        name="canAccessCalendar"
                        render={({ field }) => (
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Calendário</Label>
                              <p className="text-sm text-muted-foreground">
                                Acesso ao calendário de entregas
                              </p>
                            </div>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </div>
                        )}
                      />

                      <Separator />

                      <FormField
                        control={form.control}
                        name="canAccessProduction"
                        render={({ field }) => (
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Produção</Label>
                              <p className="text-sm text-muted-foreground">
                                Acesso à área de produção
                              </p>
                            </div>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </div>
                        )}
                      />

                      <Separator />

                      <FormField
                        control={form.control}
                        name="canAccessDelivery"
                        render={({ field }) => (
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Entrega</Label>
                              <p className="text-sm text-muted-foreground">
                                Acesso à área de entrega
                              </p>
                            </div>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </div>
                        )}
                      />

                      <Separator />

                      <FormField
                        control={form.control}
                        name="canAccessReminders"
                        render={({ field }) => (
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Lembretes</Label>
                              <p className="text-sm text-muted-foreground">
                                Acesso aos lembretes
                              </p>
                            </div>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </div>
                        )}
                      />

                      <Separator />

                      <FormField
                        control={form.control}
                        name="canAccessReports"
                        render={({ field }) => (
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Relatórios</Label>
                              <p className="text-sm text-muted-foreground">
                                Acesso aos relatórios
                              </p>
                            </div>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </div>
                        )}
                      />

                      <Separator />

                      <FormField
                        control={form.control}
                        name="canAccessSettings"
                        render={({ field }) => (
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Configurações</Label>
                              <p className="text-sm text-muted-foreground">
                                Acesso às configurações do sistema
                              </p>
                            </div>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </div>
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Modo de edição - todas as informações em uma única tela
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Nome do colaborador"
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="email@exemplo.com"
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nova Senha (deixe em branco para manter a atual)
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Nova senha (opcional)"
                            required={false}
                            disabled={isPending}
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setShowPassword(!showPassword)}
                              className="h-8 w-8"
                              disabled={isPending}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={generatePassword}
                              className="h-8 w-8"
                              disabled={isPending}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Acesso ao Sistema</h3>
                    <p className="text-sm text-muted-foreground">
                      Defina quais áreas do sistema o colaborador pode acessar.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="canAccessDashboard"
                      render={({ field }) => (
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Dashboard</Label>
                            <p className="text-sm text-muted-foreground">
                              Acesso ao painel principal
                            </p>
                          </div>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </div>
                      )}
                    />

                    <Separator />

                    <FormField
                      control={form.control}
                      name="canAccessOrders"
                      render={({ field }) => (
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Encomendas</Label>
                            <p className="text-sm text-muted-foreground">
                              Visualizar encomendas
                            </p>
                          </div>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </div>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="canCreateOrders"
                      render={({ field }) => (
                        <div className="flex items-center justify-between ml-6">
                          <div className="space-y-0.5">
                            <Label className="text-sm">Criar encomendas</Label>
                          </div>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </div>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="canEditOrders"
                      render={({ field }) => (
                        <div className="flex items-center justify-between ml-6">
                          <div className="space-y-0.5">
                            <Label className="text-sm">Editar encomendas</Label>
                          </div>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </div>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="canDeleteOrders"
                      render={({ field }) => (
                        <div className="flex items-center justify-between ml-6">
                          <div className="space-y-0.5">
                            <Label className="text-sm">
                              Excluir encomendas
                            </Label>
                          </div>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </div>
                      )}
                    />

                    <Separator />

                    <FormField
                      control={form.control}
                      name="canAccessCalendar"
                      render={({ field }) => (
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Calendário</Label>
                            <p className="text-sm text-muted-foreground">
                              Acesso ao calendário de entregas
                            </p>
                          </div>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </div>
                      )}
                    />

                    <Separator />

                    <FormField
                      control={form.control}
                      name="canAccessProduction"
                      render={({ field }) => (
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Produção</Label>
                            <p className="text-sm text-muted-foreground">
                              Acesso à área de produção
                            </p>
                          </div>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </div>
                      )}
                    />

                    <Separator />

                    <FormField
                      control={form.control}
                      name="canAccessDelivery"
                      render={({ field }) => (
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Entrega</Label>
                            <p className="text-sm text-muted-foreground">
                              Acesso à área de entrega
                            </p>
                          </div>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </div>
                      )}
                    />

                    <Separator />

                    <FormField
                      control={form.control}
                      name="canAccessReminders"
                      render={({ field }) => (
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Lembretes</Label>
                            <p className="text-sm text-muted-foreground">
                              Acesso aos lembretes
                            </p>
                          </div>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </div>
                      )}
                    />

                    <Separator />

                    <FormField
                      control={form.control}
                      name="canAccessReports"
                      render={({ field }) => (
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Relatórios</Label>
                            <p className="text-sm text-muted-foreground">
                              Acesso aos relatórios
                            </p>
                          </div>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </div>
                      )}
                    />

                    <Separator />

                    <FormField
                      control={form.control}
                      name="canAccessSettings"
                      render={({ field }) => (
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Configurações</Label>
                            <p className="text-sm text-muted-foreground">
                              Acesso às configurações do sistema
                            </p>
                          </div>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </div>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}
          </form>
        </Form>

        <DialogFooter>
          {mode === "create" && activeTab === "info" ? (
            <div className="flex justify-end items-center gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="button" onClick={handleNext} disabled={isPending}>
                Próximo
              </Button>
            </div>
          ) : mode === "create" && activeTab === "permissions" ? (
            <div className="flex justify-end items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isPending}
              >
                Voltar
              </Button>
              <Button
                type="button"
                onClick={() => form.handleSubmit(handleSubmit)()}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Criando...
                  </>
                ) : (
                  "Criar Colaborador"
                )}
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={() => form.handleSubmit(handleSubmit)()}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
