import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabaseService } from "@/services/supabaseService";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import "@/styles/calendar.css";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  client_name: string;
  due_date: string;
  price: number;
  status: "pending" | "production" | "done";
}

const getStatusClasses = (status: string | null, dueDate: string) => {
  const isOverdue = new Date(dueDate) < new Date();
  const effectiveStatus = (isOverdue && status === "pending") ? "overdue" : status;

  return cn(
    "p-1 overflow-hidden rounded-md w-full",
    effectiveStatus === "overdue" &&
      "bg-red-100/80 text-red-800 dark:bg-red-900/30 dark:text-red-200",
    effectiveStatus === "pending" &&
      "bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200",
    effectiveStatus === "production" &&
      "bg-purple-100/80 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200",
    effectiveStatus === "done" &&
      "bg-green-100/80 text-green-800 dark:bg-green-900/30 dark:text-green-200"
  );
};

const getEventColor = (status: string | null, dueDate: string) => {
  const isOverdue = new Date(dueDate) < new Date();
  const effectiveStatus = (isOverdue && status === "pending") ? "overdue" : status;

  switch (effectiveStatus) {
    case "overdue":
      return { backgroundColor: "rgb(254 226 226 / 0.8)", borderColor: "rgb(153 27 27)" }; // red-100/80 and red-800
    case "pending":
      return { backgroundColor: "rgb(254 240 138 / 0.8)", borderColor: "rgb(133 77 14)" }; // yellow-100/80 and yellow-800
    case "production":
      return { backgroundColor: "rgb(233 213 255 / 0.8)", borderColor: "rgb(107 33 168)" }; // purple-100/80 and purple-800
    case "done":
      return { backgroundColor: "rgb(187 247 208 / 0.8)", borderColor: "rgb(22 101 52)" }; // green-100/80 and green-800
    default:
      return { backgroundColor: "rgb(254 240 138 / 0.8)", borderColor: "rgb(133 77 14)" }; // yellow-100/80 and yellow-800
  }
};

const CalendarPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { tenant, isLoading } = useWorkspaceContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Calendário | Zencora Noma";
    if (!isLoading) {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant, isLoading]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabaseService.orders.getTenantOrders(
        tenant.id,
      );
      if (error) throw error;

      setOrders(
        (data || []).map((order) => ({
          ...order,
          status: order.status as "pending" | "production" | "done",
        })),
      );
    } catch (error: any) {
      toast({
        title: "Erro ao carregar encomendas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const events = orders.map((order) => {
    const colors = getEventColor(order.status, order.due_date);
    return {
    id: order.id,
    title: order.client_name,
    start: order.due_date,
      backgroundColor: colors.backgroundColor,
      borderColor: colors.borderColor,
    extendedProps: {
      price: order.price,
      status: order.status,
        dueDate: order.due_date,
    },
    };
  });

  const handleEventClick = (info: any) => {
    navigate(`/orders/${info.event.id}`);
  };

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          // Força uma atualização do calendário quando o tema muda
          const calendar = document.querySelector('.fc');
          if (calendar) {
            calendar.classList.add('theme-updated');
            setTimeout(() => calendar.classList.remove('theme-updated'), 0);
          }
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Calendário de Encomendas
        </h2>
        <p className="text-muted-foreground">
          Veja o calendário de suas encomendas.
        </p>
      </div>

      <Card>
        <CardContent className="p-8">
          <div className="calendar-container">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale={ptBrLocale}
              events={events}
              eventClick={handleEventClick}
              height="auto"
              headerToolbar={{
                left: "prev,next",
                center: "title",
                right: "today dayGridMonth,dayGridWeek",
              }}
              views={{
                dayGridMonth: {
                  titleFormat: { year: "numeric", month: "long" },
                  dayHeaderFormat: { weekday: "short" },
                  dayMaxEvents: true,
                },
                dayGridWeek: {
                  titleFormat: {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                  dayHeaderFormat: { weekday: "short" },
                  dayMaxEvents: true,
                },
              }}
              eventContent={(eventInfo) => {
                const status = eventInfo.event.extendedProps.status;
                const dueDate = eventInfo.event.extendedProps.dueDate;

                return (
                  <div className={getStatusClasses(status, dueDate)}>
                    <div className="font-medium truncate">
                      {eventInfo.event.title}
                    </div>
                    <div className="text-xs">
                      R${" "}
                      {eventInfo.event.extendedProps.price
                        .toFixed(2)
                        .replace(".", ",")}
                    </div>
                  </div>
                );
              }}
              eventTimeFormat={{
                hour: "2-digit",
                minute: "2-digit",
                meridiem: false,
              }}
              moreLinkContent={(args) => `+${args.num} mais`}
              moreLinkClick="popover"
              eventMaxStack={2}
              stickyHeaderDates={true}
              dayMaxEvents={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarPage;
