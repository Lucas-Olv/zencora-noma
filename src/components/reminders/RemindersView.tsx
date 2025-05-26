import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { Database } from "@/integrations/supabase/types";
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
import { remindersService } from "@/services/supabaseService";
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

type Reminder = Database["public"]["Tables"]["reminders"]["Row"];

export default function RemindersView() {
  const { toast } = useToast();
  const { tenant } = useAuthContext();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newReminderTitle, setNewReminderTitle] = useState("");
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editedContent, setEditedContent] = useState("");

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const { data, error } = await remindersService.getTenantReminders(tenant?.id);

      if (error) throw error;
      setReminders(data || []);
    } catch (error) {
      toast({
        title: "Erro ao carregar lembretes",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderTitle.trim()) return;

    try {
      const { data, error } = await remindersService.createReminder({
        title: newReminderTitle,
        content: "",
        is_done: false,
        tenant_id: tenant?.id,
      });
      if (error) throw error;

      if (data) {
        setReminders((prev) => [data, ...prev]);
        setNewReminderTitle("");
        toast({
          title: "Lembrete criado com sucesso!",
        });
      }
    } catch (error) {
      console.error("Error creating reminder:", error);
      toast({
        title: "Erro ao criar lembrete",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleDone = async (reminder: Reminder) => {
    try {
      const { data, error } = await remindersService.updateReminder(reminder.id, {
        is_done: !reminder.is_done,
        tenant_id: reminder.tenant_id,
        title: reminder.title,
        content: reminder.content,
      });

      if (error) throw error;

      if (data) {
        setReminders((prev) =>
          prev.map((r) => (r.id === reminder.id ? data : r))
        );
      }
      toast({
        title: "Lembrete atualizado com sucesso!",
      });
    } catch (error) {
      console.error("Error updating reminder:", error);
      toast({
        title: "Erro ao atualizar lembrete",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleOpenDetails = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setEditedContent(reminder.content);
    setIsDialogOpen(true);
  };

  const handleSaveDetails = async () => {
    if (!selectedReminder) return;

    try {
      const { data, error } = await remindersService.updateReminder(selectedReminder.id, {
        content: editedContent,
        tenant_id: selectedReminder.tenant_id,
        title: selectedReminder.title,
        is_done: selectedReminder.is_done,
      });

      if (error) throw error;

      if (data) {
        setReminders((prev) =>
          prev.map((r) => (r.id === selectedReminder.id ? data : r))
        );
        setIsDialogOpen(false);
        toast({
          title: "Lembrete atualizado com sucesso!",
        });
      }
    } catch (error) {
      console.error("Error updating reminder:", error);
      toast({
        title: "Erro ao atualizar lembrete",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedReminder) return;

    try {
      const { error } = await remindersService.deleteReminder(selectedReminder.id);
      if (error) throw error;

      setReminders((prev) => prev.filter((r) => r.id !== selectedReminder.id));
      setIsDeleteDialogOpen(false);
      setSelectedReminder(null);
      toast({
        title: "Lembrete excluído com sucesso!",
      });
    } catch (error) {
      console.error("Error deleting reminder:", error);
      toast({
        title: "Erro ao excluir lembrete",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const pendingReminders = reminders.filter((r) => !r.is_done);
  const completedReminders = reminders.filter((r) => r.is_done);

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
              <Button type="submit">Adicionar</Button>
            </div>
          </form>

          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending">
                Pendentes
                {pendingReminders.length > 0 && (
                  <Badge variant="secondary" className="ml-2">{pendingReminders.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed">
                Concluídos
                {completedReminders.length > 0 && (
                  <Badge variant="secondary" className="ml-2">{completedReminders.length}</Badge>
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
                      checked={reminder.is_done}
                      onCheckedChange={() => handleToggleDone(reminder)}
                    />
                    <span className="flex-1">
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

            <TabsContent value="completed">
              <div className="space-y-2">
                {completedReminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-center gap-2 p-2 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <Checkbox
                      checked={reminder.is_done}
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
                <DialogTitle>
                  {selectedReminder?.title}
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  placeholder="Adicione mais detalhes ao lembrete..."
                  className="min-h-[200px]"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveDetails}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir lembrete</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir este lembrete? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
} 