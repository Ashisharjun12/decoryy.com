import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CameraIcon, CheckCircle2Icon, UsersIcon } from "lucide-react";
import { listProductReviews } from "@/api/reviews.api";
import { productReviewsPath } from "@/lib/catalog-path";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductReviewCard } from "@/module/catalog/components/reviews/ProductReviewCard";
import { ProductReviewsSummary } from "@/module/catalog/components/reviews/ProductReviewsSummary";
import {
  hasProductReviews,
  resolveProductReviewCount,
} from "@/module/catalog/components/reviews/review-count";

export function ProductReviewsPreview({ productId, product }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!productId) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    listProductReviews(productId, { page: 1, limit: 3 })
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled) {
          setData(null);
          setError("Couldn't load reviews right now.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const items = data?.items ?? [];
  const reviewCount = resolveProductReviewCount({ data, product, items });
  const showSection =
    loading || hasProductReviews({ data, product, items }) || (error && Number(product?.reviewCount) > 0);

  if (!showSection) return null;

  const summary =
    data?.summary ??
    (reviewCount > 0
      ? {
          ratingAvg: product?.ratingAvg != null ? Number(product.ratingAvg) : null,
          reviewCount,
          distribution: {},
        }
      : null);

  const hasPhotos = items.some((item) => item.photos?.length > 0);
  const hasVerified = items.some((item) => item.isVerified);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Customer feedback
          </p>
          <h2 className="font-heading text-xl font-medium tracking-tight">Ratings &amp; Reviews</h2>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      ) : (
        <>
          {error ? (
            <p className="text-sm text-muted-foreground">{error}</p>
          ) : null}

          <ProductReviewsSummary summary={summary} />

          <div className="flex flex-wrap gap-2">
            {hasVerified ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                <CheckCircle2Icon className="size-3.5" />
                Verified
              </span>
            ) : null}
            {hasPhotos ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300">
                <CameraIcon className="size-3.5" />
                Real photos
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300">
              <UsersIcon className="size-3.5" />
              Real buyers
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {items.map((review) => (
              <ProductReviewCard key={review.id} review={review} />
            ))}
          </div>

          {reviewCount > 3 ? (
            <Button type="button" variant="outline" className="w-full sm:w-auto" render={<Link to={productReviewsPath(productId)} />}>
              View all reviews
            </Button>
          ) : null}
        </>
      )}
    </section>
  );
}
