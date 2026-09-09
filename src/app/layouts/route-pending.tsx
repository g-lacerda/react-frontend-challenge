import { Skeleton } from '@/shared/ui/skeleton'

export function RoutePending() {
  return (
    <div className="grid animate-fade gap-6" aria-busy="true">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-9 w-full" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} className="aspect-[2/3]" />
        ))}
      </div>
    </div>
  )
}
