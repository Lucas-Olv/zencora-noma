import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductionViewSkeleton() {
  const OrderCardSkeleton = ({ isMobile }: { isMobile: boolean }) => {
    if (isMobile) {
      return (
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
            <div className="flex flex-col items-end gap-2">
              <Skeleton className="h-6 w-20 rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 flex-1 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto] gap-4 rounded-lg border p-4">
        <div className="grid grid-cols-[minmax(0,1fr),auto] gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="mt-1">
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="mt-2">
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <div className="flex flex-col items-end justify-between gap-2">
            <Skeleton className="h-6 w-20 rounded-md" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-32 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72 mt-2" />
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-end">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-3 rounded-full" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <OrderCardSkeleton key={i} isMobile={false} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
