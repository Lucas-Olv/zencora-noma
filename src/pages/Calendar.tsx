import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import "@/styles/calendar.css";
import { cn } from "@/lib/utils";
import { useTenantStorage } from "@/storage/tenant";
import { getNomaApi } from "@/lib/apiHelpers";
import { useQuery } from "@tanstack/react-query";
import { Order } from "@/lib/types";

const getStatusClasses = (status: string | null, dueDate: string) => {
  const isOverdue = new Date(dueDate) < new Date();
  const effectiveStatus =
    isOverdue && status === "pending" ? "overdue" : status;

  return cn(
    "p-1 overflow-hidden rounded-md w-full",
    effectiveStatus === "overdue" &&
      "bg-red-100/80 text-red-800 dark:bg-red-900/30 dark:text-red-200",
    effectiveStatus === "pending" &&
      "bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200",
    effectiveStatus === "production" &&
      "bg-purple-100/80 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200",
    effectiveStatus === "delivered" &&
      "bg-green-100/80 text-green-800 dark:bg-green-900/30 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/50",
    effectiveStatus === "done" &&
      "bg-blue-100/80 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-900/50",
    effectiveStatus === "canceled" &&
      "bg-gray-100/80 text-stone-800 dark:bg-gray-900/30 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-900/50",
  );
};

const getEventColor = (status: string | null, dueDate: string) => {
  const isOverdue = new Date(dueDate) < new Date();
  const effectiveStatus =
    isOverdue && status === "pending" ? "overdue" : status;

  switch (effectiveStatus) {
    case "overdue":
      return {
        backgroundColor: "rgb(254 226 226 / 0.8)",
        borderColor: "rgb(153 27 27)",
      }; // red-100/80 and red-800
    case "pending":
      return {
        backgroundColor: "rgb(254 240 138 / 0.8)",
        borderColor: "rgb(133 77 14)",
      }; // yellow-100/80 and yellow-800
    case "production":
      return {
        backgroundColor: "rgb(233 213 255 / 0.8)",
        borderColor: "rgb(107 33 168)",
      }; // purple-100/80 and purple-800
    case "delivered":
      return {
        backgroundColor: "rgb(187 247 208 / 0.8)", // green-100/80
        borderColor: "rgb(22 101 52)", // green-800
      };
    case "canceled":
      return {
        backgroundColor: "rgb(254 226 226 / 0.8)",
        borderColor: "rgb(153 27 27)",
      }; //
    case "done":
      return {
        backgroundColor: "rgb(191 219 254 / 0.8)", // blue-100/80
        borderColor: "rgb(30 64 175)", // blue-800
      };
    default:
      return {
        backgroundColor: "rgb(254 240 138 / 0.8)",
        borderColor: "rgb(133 77 14)",
      }; // yellow-100/80 and yellow-800
  }
};

const CalendarPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { tenant } = useTenantStorage();
  const [orders, setOrders] = useState<Order[]>([]);

  const {
    data: ordersData,
    isLoading: isOrdersLoading,
    isError: isOrdersError,
    refetch,
  } = useQuery({
    queryKey: ["calendarOrders", tenant?.id],
    queryFn: () =>
      getNomaApi(`/api/noma/v1/orders/tenant`, {
        params: { tenantId: tenant?.id },
      }),
  });

  useEffect(() => {
    document.title = "Calendário | Zencora Noma";
    if (ordersData && !isOrdersLoading) {
      const fetchedOrders = ordersData.data.map((order: Order) => ({
        ...order,
        status: order.status as
          | "pending"
          | "production"
          | "done"
          | "delivered"
          | "canceled",
      }));
      setOrders(fetchedOrders);
    }
  }, [ordersData, isOrdersLoading]);

  const events = orders.map((order: Order) => {
    const colors = getEventColor(order.status, order.dueDate);
    return {
      id: order.id,
      title: order.clientName,
      start: order.dueDate,
      backgroundColor: colors.backgroundColor,
      borderColor: colors.borderColor,
      extendedProps: {
        price: order.price,
        status: order.status,
        dueDate: order.dueDate,
      },
    };
  });

  const handleEventClick = (info: any) => {
    navigate(`/orders/${info.event.id}`);
  };

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          // Força uma atualização do calendário quando o tema muda
          const calendar = document.querySelector(".fc");
          if (calendar) {
            calendar.classList.add("theme-updated");
            setTimeout(() => calendar.classList.remove("theme-updated"), 0);
          }
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
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
                  <div className={`${getStatusClasses(status, dueDate)} px-2`}>
                    <div className="flex flex-row items-center justify-between">
                      <div className="font-medium truncate max-w-24">
                        {eventInfo.event.title}
                      </div>
                      <div className="font-medium truncate">
                        {status === "overdue" && "Atrasado"}
                        {status === "pending" && "Pendente"}
                        {status === "production" && "Produção"}
                        {status === "done" && "Concluído"}
                        {status === "delivered" && "Entregue"}
                        {status === "canceled" && "Cancelado"}
                      </div>
                    </div>
                    <div className="text-xs">
                      R$ {eventInfo.event.extendedProps.price.replace(".", ",")}
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
