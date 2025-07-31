import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrderDetailSkeleton() {
  const InfoItemSkeleton = () => (
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-lg" />
      <div>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-32 mt-1" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-2">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-80 mt-2" />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-24 rounded-md" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">
              <Skeleton className="h-5 w-24" />
            </h3>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4 mt-1" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-6">
            <InfoItemSkeleton />
            <InfoItemSkeleton />
            <InfoItemSkeleton />
            <InfoItemSkeleton />
            <InfoItemSkeleton />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pt-6 border-t">
          <div className="w-full">
            <h3 className="font-semibold mb-3">
              <Skeleton className="h-5 w-16" />
            </h3>
            <div className="grid grid-rows-2 sm:grid-cols-1 gap-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </CardFooter>
      </Card>
      <Card>
        <CardContent className="flex flex-col gap-3 pt-6">
          <div className="grid grid-rows-2 sm:grid-cols-1 gap-3">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
