import { useEffect, useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash, UserPlus, Users, Link } from "lucide-react";
import { supabaseService, CollaboratorType } from "@/services/supabaseService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { LoadingState } from "@/components/ui/loading-state";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { hashPassword } from "@/lib/utils";

type CollaboratorRole = "admin" | "production" | "order";

const collaboratorSchema = z.object({
  name: z.string()
    .min(1, "O nome é obrigatório")
    .min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string()
    .min(1, "O email é obrigatório")
    .email("Email inválido")
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Digite um email válido (exemplo: nome@dominio.com)"
    ),
  password: z.string()
    .min(6, "A senha deve ter pelo menos 6 caracteres")
    .optional()
    .or(z.literal("")),
  role: z.enum(["admin", "production", "order"], {
    required_error: "A função é obrigatória",
  }),
});

type CollaboratorFormData = z.infer<typeof collaboratorSchema>;

const SettingsView = () => {
  const { tenant, loading: tenantLoading, error: tenantError } = useTenant();
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [collaborators, setCollaborators] = useState<CollaboratorType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCollaborator, setEditingCollaborator] = useState<CollaboratorType | null>(null);

  const form = useForm<CollaboratorFormData>({
    resolver: zodResolver(collaboratorSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "order",
    },
    mode: "onChange",
  });

  const resetForm = () => {
    setEditingCollaborator(null);
    form.reset({
      name: "",
      email: "",
      password: "",
      role: "order",
    });
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  useEffect(() => {
    if (!tenantLoading && tenant) {
      fetchCollaborators();
    }
  }, [tenant, tenantLoading]);

  const fetchCollaborators = async () => {
    try {
      if (tenantError || !tenant) {
        throw new Error(tenantError || 'Tenant não encontrado');
      }

      const { data, error } = await supabaseService.collaborators.getTenantCollaborators(tenant.id);
      if (error) throw error;

      const collaboratorsWithRole = (data || []).map(collaborator => ({
        ...collaborator,
        role: "order" as CollaboratorRole
      }));

      setCollaborators(collaboratorsWithRole);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar colaboradores",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CollaboratorFormData) => {
    if (!tenant) {
      toast({
        title: "Erro",
        description: "Tenant não encontrado",
        variant: "destructive",
      });
      return;
    }

    if (!editingCollaborator && !data.password) {
      form.setError("password", {
        type: "manual",
        message: "A senha é obrigatória para novos colaboradores",
      });
      return;
    }

    try {
      const hashedPassword = data.password ? await hashPassword(data.password) : undefined;

      const collaboratorData = {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        tenant_id: tenant.id,
        can_login: true,
        role: data.role,
      };

      if (editingCollaborator) {
        const { error } = await supabaseService.collaborators.updateCollaborator(
          editingCollaborator.id,
          collaboratorData
        );
        if (error) throw error;
        
        toast({
          title: "Colaborador atualizado",
          description: "O colaborador foi atualizado com sucesso.",
        });
      } else {
        const { error } = await supabaseService.collaborators.createCollaborator(collaboratorData);
        if (error) throw error;
        
        toast({
          title: "Colaborador criado",
          description: "O colaborador foi criado com sucesso.",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchCollaborators();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar colaborador",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (collaborator: CollaboratorType) => {
    setEditingCollaborator(collaborator);
    form.reset({
      name: collaborator.name,
      email: collaborator.email || "",
      password: "",
      role: (collaborator.role || "order") as CollaboratorRole,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabaseService.collaborators.deleteCollaborator(id);
      if (error) throw error;

      toast({
        title: "Colaborador excluído",
        description: "O colaborador foi removido com sucesso.",
      });
      
      fetchCollaborators();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir colaborador",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const renderCollaboratorList = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    return (
      <LoadingState
        loading={loading}
        empty={!collaborators.length}
        emptyText="Você ainda não possui colaboradores cadastrados"
        emptyIcon={<Users className="h-12 w-12 text-muted-foreground" />}
      >
        {isMobile ? (
          <div className="space-y-4">
            {collaborators.map((collaborator) => (
              <div key={collaborator.id} className="grid grid-cols-1 gap-4 rounded-lg border p-4">
                <div className="grid grid-cols-[minmax(0,1fr),auto] gap-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{collaborator.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{collaborator.email}</p>
                    <div className="mt-2">
                      <span className="text-sm text-muted-foreground">
                        Função:{" "}
                        <span className="font-medium">
                          {collaborator.role === "admin" && "Administrador"}
                          {collaborator.role === "production" && "Produção"}
                          {collaborator.role === "order" && "Pedidos"}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(collaborator)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="w-[calc(100%-2rem)] max-w-[400px] mx-auto rounded-xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Tem certeza que deseja excluir este colaborador?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. O colaborador será
                            permanentemente removido do sistema.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(collaborator.id)}
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Função</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collaborators.map((collaborator) => (
                <TableRow key={collaborator.id}>
                  <TableCell>{collaborator.name}</TableCell>
                  <TableCell>{collaborator.email}</TableCell>
                  <TableCell>
                    {collaborator.role === "admin" && "Administrador"}
                    {collaborator.role === "production" && "Produção"}
                    {collaborator.role === "order" && "Pedidos"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(collaborator)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="w-[calc(100%-2rem)] max-w-[400px] mx-auto rounded-xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Tem certeza que deseja excluir este colaborador?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. O colaborador será
                            permanentemente removido do sistema.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(collaborator.id)}
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </LoadingState>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações da sua conta e colaboradores.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Colaboradores</CardTitle>
              <CardDescription>
                Gerencie os colaboradores que têm acesso ao sistema.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row sm:justify-center md:justify-end mb-4 gap-4">
          <Button
              variant="outline"
              onClick={() => {
                const baseUrl = import.meta.env.VITE_NOMA_BASE_URL;
                if (!baseUrl) {
                  toast({
                    title: "Erro",
                    description: "URL base não configurada",
                    variant: "destructive",
                  });
                  return;
                }
                const url = `${baseUrl}collaborators/${tenant?.id}`;
                navigator.clipboard.writeText(url).then(() => {
                  toast({
                    title: "Link copiado!",
                    description: "O link foi copiado para a área de transferência.",
                  });
                }).catch(() => {
                  toast({
                    title: "Erro",
                    description: "Não foi possível copiar o link",
                    variant: "destructive",
                  });
                });
              }}
            >
              <Link className="w-4 h-4 mr-2" />
              Link para acesso de colaboradores
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Adicionar Colaborador
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[calc(100%-2rem)] max-w-[425px] mx-auto rounded-xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingCollaborator ? "Editar Colaborador" : "Novo Colaborador"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCollaborator
                      ? "Atualize as informações do colaborador."
                      : "Preencha as informações para adicionar um novo colaborador."}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
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
                          <FormLabel>
                            {editingCollaborator ? "Nova Senha (opcional)" : "Senha"}
                            {!editingCollaborator && <span className="text-destructive ml-1">*</span>}
                          </FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Função</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a função" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="admin">Administrador</SelectItem>
                              <SelectItem value="production">Produção</SelectItem>
                              <SelectItem value="order">Pedidos</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" className="w-full sm:w-auto">
                        {editingCollaborator ? "Atualizar" : "Criar"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {renderCollaboratorList()}
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsView; 