import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

export default function CollaboratorsListSkeleton() {
  const isMobile = useIsMobile();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Controle de Acesso</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={
              isMobile
                ? "p-4 border rounded-lg space-y-3"
                : "flex items-center justify-between p-4 border rounded-lg"
            }
          >
            {isMobile ? (
              <>
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <div className="flex flex-wrap gap-1">
                    {[1, 2, 3].map((j) => (
                      <Skeleton key={j} className="h-6 w-16" />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <Skeleton className="h-6 w-16" />
                  <div className="flex space-x-1">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20" />
              </>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
