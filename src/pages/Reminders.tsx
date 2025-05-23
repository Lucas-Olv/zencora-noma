import { useState, useEffect } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import { supabase } from "../integrations/supabase/client";
import { Database } from "../integrations/supabase/types";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { Checkbox } from "../components/ui/checkbox";
import { toast } from "sonner";
import { useTenant } from "../contexts/TenantContext";
type Reminder = Database["public"]["Tables"]["reminders"]["Row"];

export default function Reminders() {
  const { user } = useAuthContext();
  const { tenant } = useTenant();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newReminderTitle, setNewReminderTitle] = useState("");
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editedContent, setEditedContent] = useState("");

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const { data, error } = await supabase
        .from("reminders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReminders(data || []);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      toast.error("Erro ao carregar lembretes");
    }
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderTitle.trim()) return;

    try {
      const { data, error } = await supabase.from("reminders").insert({
        title: newReminderTitle,
        content: "",
        is_done: false,
        tenant_id: tenant?.id,
      }).select();

      if (error) throw error;

      setReminders([...(data || []), ...reminders]);
      setNewReminderTitle("");
      toast.success("Lembrete criado com sucesso!");
    } catch (error) {
      console.error("Error creating reminder:", error);
      toast.error("Erro ao criar lembrete");
    }
  };

  const handleToggleDone = async (reminder: Reminder) => {
    try {
      const { error } = await supabase
        .from("reminders")
        .update({ is_done: !reminder.is_done })
        .eq("id", reminder.id);

      if (error) throw error;

      setReminders(
        reminders.map((r) =>
          r.id === reminder.id ? { ...r, is_done: !r.is_done } : r
        )
      );
    } catch (error) {
      console.error("Error updating reminder:", error);
      toast.error("Erro ao atualizar lembrete");
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
      const { error } = await supabase
        .from("reminders")
        .update({ content: editedContent })
        .eq("id", selectedReminder.id);

      if (error) throw error;

      setReminders(
        reminders.map((r) =>
          r.id === selectedReminder.id ? { ...r, content: editedContent } : r
        )
      );
      setIsDialogOpen(false);
      toast.success("Lembrete atualizado com sucesso!");
    } catch (error) {
      console.error("Error updating reminder:", error);
      toast.error("Erro ao atualizar lembrete");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Lembretes</h1>

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

      <div className="space-y-2">
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50"
          >
            <Checkbox
              checked={reminder.is_done}
              onCheckedChange={() => handleToggleDone(reminder)}
            />
            <span
              className={`flex-1 ${
                reminder.is_done ? "line-through text-gray-500" : ""
              }`}
            >
              {reminder.title}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenDetails(reminder)}
            >
              Detalhes
            </Button>
          </div>
        ))}
      </div>

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
    </div>
  );
} 