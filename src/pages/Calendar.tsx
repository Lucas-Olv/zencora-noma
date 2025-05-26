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
import { useAuthContext } from "@/contexts/AuthContext";

interface Order {
  id: string;
  client_name: string;
  due_date: string;
  price: number;
  status: "pending" | "production" | "done";
}

const getStatusColor = (status: string | null) => {
  switch (status) {
    case "pending":
      return "#fef08a"; // yellow-200
    case "production":
      return "#e9d5ff"; // purple-200
    case "done":
      return "#bbf7d0"; // green-200
    default:
      return "#fef08a"; // yellow-200
  }
};

const getStatusTextColor = (status: string | null) => {
  switch (status) {
    case "pending":
      return "#854d0e"; // yellow-800
    case "production":
      return "#6b21a8"; // purple-800
    case "done":
      return "#166534"; // green-800
    default:
      return "#854d0e"; // yellow-800
  }
};

const CalendarPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { tenant, loading: tenantLoading, error: tenantError } = useAuthContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Calendário | Zencora Noma";
    if (!tenantLoading && tenant) {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant, tenantLoading]);

  const fetchOrders = async () => {
    try {
      if (tenantLoading) return;
      if (tenantError || !tenant)
        throw new Error(tenantError || "Tenant não encontrado");

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

  const events = orders.map((order) => ({
    id: order.id,
    title: order.client_name,
    start: order.due_date,
    backgroundColor: getStatusColor(order.status),
    textColor: getStatusTextColor(order.status),
    extendedProps: {
      price: order.price,
      status: order.status,
    },
  }));

  const handleEventClick = (info: any) => {
    navigate(`/orders/${info.event.id}`);
  };

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
                const bgColor = getStatusColor(status);
                const textColor = getStatusTextColor(status);

                return (
                  <div
                    className="p-1 overflow-hidden rounded-md w-full"
                    style={{
                      backgroundColor: bgColor,
                      color: textColor,
                    }}
                  >
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
