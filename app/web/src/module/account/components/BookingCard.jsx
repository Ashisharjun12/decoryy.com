import { Link } from "react-router-dom";
import { formatPaise } from "@/lib/money";
import { DecoryImageFallback } from "@/components/decory-image-fallback";
import { cn } from "@/lib/utils";
import {
  bookingStatusLabel,
  bookingStatusTone,
  formatBookingSlot,
} from "@/module/account/lib/booking-ui";

function StatusBadge({ status }) {
  const tone = bookingStatusTone(status);
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
        tone === "success" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
        tone === "active" && "bg-primary/10 text-foreground",
        tone === "warning" && "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300",
        tone === "muted" && "bg-muted text-muted-foreground",
        tone === "neutral" && "bg-secondary text-secondary-foreground",
      )}
    >
      {bookingStatusLabel(status)}
    </span>
  );
}

export function BookingCard({ booking }) {
  const title =
    booking.itemCount > 1
      ? `${booking.primaryName} + ${booking.itemCount - 1} more`
      : booking.primaryName;

  return (
    <Link
      to={`/account/bookings/${booking.id}`}
      className="group flex gap-4 rounded-3xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
    >
      <div className="size-20 shrink-0 overflow-hidden rounded-2xl bg-muted">
        {booking.primaryImageUrl ? (
          <img
            src={booking.primaryImageUrl}
            alt=""
            className="size-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
          />
        ) : (
          <DecoryImageFallback className="size-full" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="line-clamp-2 font-heading text-base font-semibold tracking-tight">
              {title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatBookingSlot(booking.scheduledAt)} · {booking.cityName}
            </p>
          </div>
          <p className="shrink-0 text-sm font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
            {formatPaise(booking.subtotalPaise)}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={booking.status} />
            {booking.canReview ? (
              <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Leave a review
              </span>
            ) : null}
          </div>
          <span className="font-mono text-xs text-muted-foreground">{booking.reference}</span>
        </div>
      </div>
    </Link>
  );
}

export function BookingCardSkeleton() {
  return (
    <div className="flex gap-4 rounded-3xl border border-border bg-card p-4">
      <div className="size-20 shrink-0 animate-pulse rounded-2xl bg-muted" />
      <div className="flex flex-1 flex-col gap-3">
        <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
      </div>
    </div>
  );
}
