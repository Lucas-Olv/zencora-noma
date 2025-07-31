import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CalendarSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80 mt-2" />
      </div>

      <Card>
        <CardContent className="p-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <Skeleton className="h-8 w-full md:w-16" />
              <Skeleton className="h-8 w-full md:w-16" />
            </div>
            <Skeleton className="h-6 w-full md:w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-full md:w-20" />
              <Skeleton className="h-8 w-full md:w-20" />
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {[...Array(35)].map((_, i) => (
              <div
                key={i}
                className="h-28 border rounded-md p-2 flex flex-col gap-1"
              >
                <Skeleton className="h-4 w-6" />
                <Skeleton className="h-5 w-full rounded" />
                <Skeleton className="h-5 w-full rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
