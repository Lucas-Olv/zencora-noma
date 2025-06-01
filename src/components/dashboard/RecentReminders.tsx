import { Bell, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import { Tables } from "@/integrations/supabase/types";
import { remindersService } from "@/services/supabaseService";
import { useRef, useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

type Reminder = Tables<"reminders">;

interface RecentRemindersProps {
  reminders: Reminder[];
  loading?: boolean;
}

function RecentReminders({ reminders: initialReminders, loading = false }: RecentRemindersProps) {
  const { toast } = useToast();
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);

  useEffect(() => {
    const sortedReminders = initialReminders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const slicedReminders = sortedReminders.slice(0, 5);
    setReminders(slicedReminders);
  }, [initialReminders]);

  const AutoResizeTextarea = ({
    value,
    className,
  }: {
    value: string;
    className?: string;
  }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, [value]);

    return (
      <textarea
        ref={textareaRef}
        className={className}
        value={value}
        readOnly
        rows={1}
      />
    );
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
      toast({
        title: "Erro ao atualizar lembrete",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleOpenDetails = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lembretes Recentes</CardTitle>
        <CardDescription>Seus lembretes mais recentes</CardDescription>
      </CardHeader>
      <CardContent>
        <LoadingState
          loading={loading}
          empty={!reminders.length}
          emptyText="Nenhum lembrete recente"
          emptyIcon={<Bell className="h-12 w-12 text-muted-foreground" />}
        >
          <div className="space-y-2">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-center gap-2 p-2 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <Checkbox
                  checked={reminder.is_done}
                  onCheckedChange={() => handleToggleDone(reminder)}
                />
                <span className={`flex-1 ${reminder.is_done ? "line-through text-muted-foreground" : ""}`}>
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
        </LoadingState>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedReminder?.title}</DialogTitle>
            </DialogHeader>

            <div className="py-4 min-h-[200px]">
              {selectedReminder?.content?.trim() ? (
                <AutoResizeTextarea
                  value={selectedReminder.content}
                  className="text-muted-foreground w-full px-0 py-1 resize-none overflow-hidden bg-transparent focus:outline-none focus:ring-0 readOnly"
                />
              ) : (
                <div className="flex flex-col items-center text-muted-foreground h-full justify-center">
                  <FileText className="w-10 h-10 mb-2" />
                  <span>Nenhum conteúdo disponível</span>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </CardContent>
    </Card>
  );
}

export default RecentReminders;
