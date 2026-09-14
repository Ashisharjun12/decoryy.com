import { format } from "date-fns";
import { BadgeCheckIcon, MapPinIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function StarRow({ rating, className }) {
  return (
    <div className={cn("flex gap-0.5", className)} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          className={cn(
            "text-sm",
            index < rating ? "text-amber-500" : "text-muted-foreground/30",
          )}
          aria-hidden
        >
          ★
        </span>
      ))}
    </div>
  );
}

function initials(name) {
  const parts = String(name ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatReviewDate(value) {
  if (!value) return "";
  try {
    return format(new Date(value), "MMM yyyy");
  } catch {
    return "";
  }
}

export function ProductReviewCard({ review, className }) {
  const avatarUrl = review?.avatar?.url || review?.avatar?.thumbnailUrl;
  const dateLabel = formatReviewDate(review?.reviewedAt);

  return (
    <article className={cn("rounded-2xl border bg-card p-4 shadow-sm", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-violet-100 text-sm font-semibold text-violet-700 dark:bg-violet-950 dark:text-violet-200">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="size-full object-cover" />
            ) : (
              initials(review?.reviewerName)
            )}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="font-medium">{review.reviewerName}</h3>
              {review.isVerified ? (
                <BadgeCheckIcon className="size-4 text-sky-600" aria-label="Verified purchase" />
              ) : null}
            </div>
            {review.reviewerCity ? (
              <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <MapPinIcon className="size-3" />
                {review.reviewerCity}
              </p>
            ) : null}
          </div>
        </div>
        {dateLabel ? <time className="shrink-0 text-xs text-muted-foreground">{dateLabel}</time> : null}
      </div>

      <StarRow rating={review.rating} className="mt-3" />
      <p className="mt-2 text-sm leading-relaxed text-foreground/90">{review.body}</p>
    </article>
  );
}
