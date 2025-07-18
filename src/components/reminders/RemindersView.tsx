import { useState, useEffect } from "react";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTenantStorage } from "@/storage/tenant";

import { Reminder } from "@/lib/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  delNomaAPi,
  getNomaApi,
  patchNomaApi,
  postNomaApi,
} from "@/lib/apiHelpers";
const RemindersView = () => {
  const { toast } = useToast();
  const { tenant } = useTenantStorage();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newReminderTitle, setNewReminderTitle] = useState("");
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editedContent, setEditedContent] = useState("");

  const {
    data: remindersData,
    isLoading: isRemindersLoading,
    isError: isRemindersError,
    refetch: refetchReminders,
  } = useQuery({
    queryKey: ["Reminders"],
    queryFn: () =>
      getNomaApi("/api/noma/v1/reminders/tenant", {
        params: { tenantId: tenant?.id },
      }),
  });

  const {
    mutate: deleteReminder,
    data: deleteReminderData,
    error: isDeleteReminderError,
    isPending: isDeleteReminderPending,
  } = useMutation({
    mutationFn: ({ reminderId }: { reminderId: string }) =>
      delNomaAPi(`/api/noma/v1/reminders/delete`, {
        params: { tenantId: tenant?.id, reminderId: reminderId },
      }),
    onSuccess: () => {
      refetchReminders();
      toast({
        title: "Lembrete excluído com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir lembrete",
        description:
          "Ocorreu um erro ao excluir o lembrete. Por favor, tente novamente mais tarde.",
        variant: "destructive",
      });
      console.log(error);
    },
  });

  const {
    mutate: createReminder,
    data: createReminderData,
    error: isCreateReminderError,
    isPending: isCreateReminderPending,
  } = useMutation({
    mutationFn: ({ reminderData }: { reminderData: Reminder }) =>
      postNomaApi(
        `/api/noma/v1/reminders/create`,
        { reminderData },
        { params: { tenantId: tenant?.id } },
      ),
    onSuccess: () => {
      refetchReminders();
      toast({
        title: "Lembrete criado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar lembrete",
        description:
          "Ocorreu um erro ao criar o lembrete. Por favor, tente novamente mais tarde.",
        variant: "destructive",
      });
      console.log(error);
    },
  });

  const {
    mutate: updateReminder,
    data: updateReminderData,
    error: isUpdateReminderError,
    isPending: isUpdateReminderPending,
  } = useMutation({
    mutationFn: ({ reminderData }: { reminderData: Reminder }) =>
      patchNomaApi(
        `/api/noma/v1/reminders/update`,
        { reminderData },
        { params: { tenantId: tenant?.id, reminderId: reminderData.id } },
      ),
    onSuccess: () => {
      refetchReminders();
      toast({
        title: "Lembrete atualizado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar lembrete",
        description:
          "Ocorreu um erro ao atualizar o lembrete. Por favor, tente novamente mais tarde.",
        variant: "destructive",
      });
      console.log(error);
    },
  });

  const {
    mutate: updateReminderStatus,
    data: updateReminderStatusData,
    error: isUpdateReminderStatusError,
    isPending: isUpdateReminderStatusPending,
  } = useMutation({
    mutationFn: ({
      reminderData,
    }: {
      reminderData: Omit<Reminder, "content" | "title" | "createdAt">;
    }) =>
      patchNomaApi(
        `/api/noma/v1/reminders/update`,
        { reminderData },
        { params: { tenantId: tenant?.id, reminderId: reminderData.id } },
      ),
    onError: (error) => {
      toast({
        title: "Erro ao atualizar status do lembrete",
        description:
          "Ocorreu um erro ao atualizar o status do lembrete. Por favor, tente novamente mais tarde.",
        variant: "destructive",
      });
      console.log(error);
    },
  });

  useEffect(() => {
    if (remindersData) {
      setReminders(remindersData.data);
    }
    document.title = "Lembretes | Zencora Noma";
  }, [remindersData, isRemindersLoading, isRemindersError]);

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderTitle.trim()) return;

    createReminder({
      reminderData: {
        title: newReminderTitle,
        tenantId: tenant?.id,
        id: null,
        content: "",
        isDone: false,
      },
    });

    setNewReminderTitle("");
  };

  const handleToggleDone = async (reminder: Reminder) => {
    if (!reminder.id) return;
    updateReminderStatus(
      {
        reminderData: {
          id: reminder.id,
          tenantId: reminder.tenantId,
          isDone: !reminder.isDone,
          updatedAt: new Date().toISOString(),
        },
      },
      {
        onSuccess: () => {
          refetchReminders();
          toast({
            title: "Status do lembrete atualizado com sucesso!",
            description: `O lembrete foi marcado como ${!reminder.isDone ? "concluído" : "pendente"}`,
          });
        },
      },
    );
  };

  const handleOpenDetails = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setEditedContent(reminder.content);
    setIsDialogOpen(true);
  };

  const handleSaveDetails = async () => {
    if (!selectedReminder) return;
    updateReminder({
      reminderData: {
        id: selectedReminder.id,
        tenantId: selectedReminder.tenantId,
        title: selectedReminder.title,
        content: editedContent,
        isDone: selectedReminder.isDone,
      },
    });

    setIsDialogOpen(false);
    setSelectedReminder(null);
  };

  const handleDelete = async () => {
    if (!selectedReminder) return;
    deleteReminder({ reminderId: selectedReminder.id });
    setIsDeleteDialogOpen(false);
    setSelectedReminder(null);
  };

  const pendingReminders = reminders.filter((r) => !r.isDone);
  const completedReminders = reminders.filter((r) => r.isDone);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Painel de Lembretes</h1>
        <p className="text-muted-foreground">
          Aqui você pode adicionar quantos lembretes quiser.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lembretes</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateReminder} className="mb-6">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Adicionar novo lembrete..."
                value={newReminderTitle}
                onChange={(e) => setNewReminderTitle(e.target.value)}
                className="flex-1"
              />
              <Button disabled={newReminderTitle.length <= 0} type="submit">
                Adicionar
              </Button>
            </div>
          </form>

          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending">
                Pendentes
                {pendingReminders.length > 0 && (
                  <Badge variant="default" className="ml-2">
                    {pendingReminders.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed">
                Concluídos
                {completedReminders.length > 0 && (
                  <Badge variant="default" className="ml-2">
                    {completedReminders.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <div className="space-y-2">
                {pendingReminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-center gap-2 p-2 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <Checkbox
                      checked={reminder.isDone}
                      onCheckedChange={() => handleToggleDone(reminder)}
                    />
                    <span className="flex-1">{reminder.title}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDetails(reminder)}
                    >
                      Detalhes
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedReminder(reminder);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="completed">
              <div className="space-y-2">
                {completedReminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-center gap-2 p-2 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <Checkbox
                      checked={reminder.isDone}
                      onCheckedChange={() => handleToggleDone(reminder)}
                    />
                    <span className="flex-1 line-through text-muted-foreground">
                      {reminder.title}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDetails(reminder)}
                    >
                      Detalhes
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedReminder(reminder);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedReminder?.title}</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  placeholder="Adicione mais detalhes ao lembrete..."
                  className="min-h-[200px]"
                />
              </div>
              <DialogFooter className="flex justify-end gap-2 md:gap-0">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSaveDetails}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir lembrete?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir este lembrete? Esta ação não
                  pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleDelete}
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default RemindersView;
