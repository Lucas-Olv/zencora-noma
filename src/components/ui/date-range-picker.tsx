import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (date: DateRange | undefined) => void;
  className?: string;
}

export function DateRangePicker({
  value,
  onChange,
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const calendarRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("grid gap-2 relative", className)}>
      <Button
        ref={buttonRef}
        id="date"
        variant={"outline"}
        className={cn(
          "w-[300px] justify-start text-left font-normal",
          !value && "text-muted-foreground"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {value?.from ? (
          value.to ? (
            <>
              {format(value.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
              {format(value.to, "dd/MM/yyyy", { locale: ptBR })}
            </>
          ) : (
            format(value.from, "dd/MM/yyyy", { locale: ptBR })
          )
        ) : (
          <span>Selecionar período</span>
        )}
      </Button>
      {isOpen && (
        <div
          ref={calendarRef}
          className="absolute z-50 w-auto rounded-md border bg-popover p-0 shadow-md"
          style={{
            top: "100%",
            left: 0,
            marginTop: 4
          }}
        >
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={(date) => {
              onChange?.(date);
              if (date?.to) {
                setIsOpen(false);
              }
            }}
            numberOfMonths={2}
            locale={ptBR}
          />
        </div>
      )}
    </div>
  );
} 