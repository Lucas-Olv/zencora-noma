import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Collaborator } from "@/lib/types";
import { RefreshCw, Eye, EyeOff } from "lucide-react";

// Schema para validação do formulário
const collaboratorSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  canAccessReports: z.boolean(),
  canAccessCalendar: z.boolean(),
  canAccessProduction: z.boolean(),
  canAccessOrders: z.boolean(),
  canAccessReminders: z.boolean(),
  canAccessSettings: z.boolean(),
  canAccessDashboard: z.boolean(),
  canCreateOrders: z.boolean(),
  canDeleteOrders: z.boolean(),
  canEditOrders: z.boolean(),
});

type CollaboratorFormData = z.infer<typeof collaboratorSchema>;

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
    resolver: zodResolver(collaboratorSchema),
    defaultValues: {
      name: collaborator?.name || "",
      email: collaborator?.email || "",
      password: mode === "edit" ? "" : collaborator?.password || "",
      canAccessReports: collaborator?.canAccessReports || false,
      canAccessCalendar: collaborator?.canAccessCalendar || false,
      canAccessProduction: collaborator?.canAccessProduction || false,
      canAccessOrders: collaborator?.canAccessOrders || false,
      canAccessReminders: collaborator?.canAccessReminders || false,
      canAccessSettings: collaborator?.canAccessSettings || false,
      canAccessDashboard: collaborator?.canAccessDashboard || false,
      canCreateOrders: collaborator?.canCreateOrders || false,
      canDeleteOrders: collaborator?.canDeleteOrders || false,
      canEditOrders: collaborator?.canEditOrders || false,
    },
  });

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
    } else {
      onSubmit(data);
    }
  };

  const handleNext = () => {
    const name = form.getValues("name");
    const email = form.getValues("email");
    const password = form.getValues("password");

    if (name && email && password) {
      setActiveTab("permissions");
    } else {
      form.trigger(["name", "email", "password"]);
    }
  };

  const handleBack = () => {
    setActiveTab("info");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Novo Colaborador" : "Editar Colaborador"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Preencha as informações para criar um novo colaborador."
              : "Atualize as informações do colaborador conforme necessário."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {mode === "create" ? (
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="info">Informações</TabsTrigger>
                  <TabsTrigger value="permissions">Permissões</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nome do colaborador" />
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
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowPassword(!showPassword)}
                                className="h-8 w-8"
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
                </TabsContent>

                <TabsContent value="permissions" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Acesso ao Sistema</h3>
                      <p className="text-sm text-muted-foreground">
                        Defina quais áreas do sistema o colaborador pode
                        acessar.
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
                              <Label className="text-sm">
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
                          <div className="flex items-center justify-between ml-6">
                            <div className="space-y-0.5">
                              <Label className="text-sm">
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
                </TabsContent>
              </Tabs>
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
                          <Input {...field} placeholder="Nome do colaborador" />
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
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setShowPassword(!showPassword)}
                              className="h-8 w-8"
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

            <DialogFooter>
              {mode === "create" && activeTab === "info" ? (
                <Button type="button" onClick={handleNext}>
                  Próximo
                </Button>
              ) : mode === "create" && activeTab === "permissions" ? (
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Voltar
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Criando..." : "Criar Colaborador"}
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
