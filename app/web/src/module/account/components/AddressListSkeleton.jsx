import { Skeleton } from "@/components/ui/skeleton";

function AddressCardSkeleton() {
  return (
    <li className="rounded-xl border border-border bg-card px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2.5">
          <Skeleton className="h-4 w-28 rounded-md" />
          <Skeleton className="h-3 w-36 rounded-md" />
          <Skeleton className="h-3 w-full max-w-md rounded-md" />
          <Skeleton className="h-3 w-[80%] max-w-sm rounded-md" />
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <Skeleton className="h-3 w-8 rounded-md" />
          <Skeleton className="h-3 w-14 rounded-md" />
          <Skeleton className="h-3 w-12 rounded-md" />
        </div>
      </div>
    </li>
  );
}

export function AddressListSkeleton({ count = 2, className = "mt-6" }) {
  return (
    <ul className={`space-y-3 ${className}`} aria-busy="true" aria-label="Loading addresses">
      {Array.from({ length: count }, (_, index) => (
        <AddressCardSkeleton key={index} />
      ))}
    </ul>
  );
}

export function BookingAddressListSkeleton({ className = "mt-10" }) {
  return (
    <section className={className} aria-busy="true" aria-label="Loading booking addresses">
      <Skeleton className="h-4 w-40 rounded-md" />
      <Skeleton className="mt-2 h-3 w-56 rounded-md" />
      <ul className="mt-4 divide-y divide-border border-t border-border">
        {Array.from({ length: 2 }, (_, index) => (
          <li key={index} className="space-y-2 py-4">
            <Skeleton className="h-4 w-48 rounded-md" />
            <Skeleton className="h-3 w-full max-w-lg rounded-md" />
            <Skeleton className="h-3 w-24 rounded-md" />
          </li>
        ))}
      </ul>
    </section>
  );
}
