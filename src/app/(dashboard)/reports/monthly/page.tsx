import { Suspense } from "react";
import MonthlyReports from "@/components/reports/MonthlyReports";
import { LoadingState } from "@/components/ui/loading-state";
import { FileText } from "lucide-react";

export default function MonthlyReportsPage() {
  return (
    <Suspense
      fallback={
        <LoadingState
          loading={true}
          empty={false}
          emptyText="Nenhum relatório encontrado"
          emptyIcon={<FileText className="h-12 w-12 text-muted-foreground" />}
        >
          <div />
        </LoadingState>
      }
    >
      <MonthlyReports />
    </Suspense>
  );
} 