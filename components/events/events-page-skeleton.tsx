import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function EventsPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Title & subtitle */}
        {/* <Skeleton className="h-12 w-64 mx-auto" />
        <Skeleton className="h-4 w-96 mx-auto" /> */}

        {/* Filter tags */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-col items-center space-y-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
            </Card>
          ))}
        </div> */}

        {/* Event card previews */}
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-64 w-full rounded-lg" />
          <div className="space-y-4 w-full">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div> */}

        {/* Grid of events */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <Skeleton className="h-40 w-full rounded-t-lg" />
              <CardHeader className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
