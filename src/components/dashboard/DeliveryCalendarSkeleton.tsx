import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DeliveryCalendarSkeleton() {
  const renderOrderSectionSkeleton = (title: string) => (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">
        <Skeleton className="h-4 w-24" />
      </h3>
      <div className="grid grid-cols-1 gap-4 rounded-lg border p-4">
        <div className="grid grid-cols-[minmax(0,1fr),auto] gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="mt-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mt-1" />
            </div>
            <div className="mt-2">
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <div className="flex items-center justify-end">
            <Skeleton className="h-6 w-20 rounded-md" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 rounded-lg border p-4">
        <div className="grid grid-cols-[minmax(0,1fr),auto] gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="mt-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mt-1" />
            </div>
            <div className="mt-2">
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <div className="flex items-center justify-end">
            <Skeleton className="h-6 w-20 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64 mt-1" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {renderOrderSectionSkeleton("Atrasadas")}
          {renderOrderSectionSkeleton("Hoje")}
        </div>
      </CardContent>
    </Card>
  );
}
