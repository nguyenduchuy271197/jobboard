import { Card, CardContent } from "@/components/ui/card";

export function JobsLoading() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-3">
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-muted rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
                <div className="w-16 h-6 bg-muted rounded" />
              </div>

              {/* Job Info */}
              <div className="flex gap-4">
                <div className="h-4 bg-muted rounded w-24" />
                <div className="h-4 bg-muted rounded w-20" />
                <div className="h-4 bg-muted rounded w-16" />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="h-6 bg-muted rounded w-32" />
                <div className="flex gap-4">
                  <div className="h-4 bg-muted rounded w-20" />
                  <div className="h-8 bg-muted rounded w-24" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
