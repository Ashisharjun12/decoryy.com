import { cn } from "@/lib/utils";

function StarRow({ rating, size = "md" }) {
  const rounded = Math.round(rating ?? 0);
  return (
    <div
      className={cn("flex gap-0.5", size === "lg" ? "text-lg" : "text-sm")}
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          className={index < rounded ? "text-amber-500" : "text-muted-foreground/30"}
          aria-hidden
        >
          ★
        </span>
      ))}
    </div>
  );
}

function distributionPercent(count, total) {
  if (!total) return 0;
  return Math.round((count / total) * 100);
}

export function ProductReviewsSummary({ summary, className }) {
  const ratingAvg = summary?.ratingAvg;
  const reviewCount = summary?.reviewCount ?? 0;
  const distribution = summary?.distribution ?? {};

  if (!reviewCount) return null;

  const rows = [5, 4, 3, 2, 1];

  return (
    <div className={cn("rounded-2xl border bg-muted/30 p-4 sm:p-5", className)}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-4xl font-semibold tracking-tight tabular-nums">
            {ratingAvg != null ? Number(ratingAvg).toFixed(1) : "—"}
          </p>
          <StarRow rating={ratingAvg ?? 0} size="lg" />
          <p className="mt-1 text-sm text-muted-foreground">
            {reviewCount} review{reviewCount === 1 ? "" : "s"}
          </p>
        </div>

        <div className="min-w-0 flex-1 space-y-2 sm:max-w-xs">
          {rows.map((stars) => {
            const count = distribution[stars] ?? distribution[String(stars)] ?? 0;
            const percent = distributionPercent(count, reviewCount);
            return (
              <div key={stars} className="grid grid-cols-[2rem_1fr_2.5rem] items-center gap-2 text-xs">
                <span className="text-muted-foreground">{stars}</span>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-amber-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="text-right tabular-nums text-muted-foreground">{percent}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
