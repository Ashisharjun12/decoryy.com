import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { productPath } from "@/lib/catalog-path";
import { formatPaise } from "@/lib/money";
import { DecoryImageFallback } from "@/components/decory-image-fallback";
import { Skeleton } from "@/components/ui/skeleton";
import { staggerItem } from "@/lib/motion-variants";
import { cn } from "@/lib/utils";

function discountPercent(pricePaise, compareAtPaise) {
  if (compareAtPaise == null || compareAtPaise <= pricePaise) return 0;
  return Math.round((1 - pricePaise / compareAtPaise) * 100);
}

function CompactProductCardContent({ product }) {
  const [broken, setBroken] = useState(false);
  const src = product.imageUrl ?? product.images?.[0]?.url;
  const percentOff = discountPercent(product.pricePaise, product.compareAtPaise);
  const hasCompare =
    product.compareAtPaise != null && product.compareAtPaise > product.pricePaise;

  return (
    <Link
      to={productPath(product)}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-muted">
        {src && !broken ? (
          <img
            src={src}
            alt=""
            className="size-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
            onError={() => setBroken(true)}
          />
        ) : (
          <DecoryImageFallback />
        )}
      </div>
      <div className="flex flex-1 flex-col px-2.5 pt-2.5 pb-3">
        <h3 className="line-clamp-2 min-h-[2.5em] text-[13px] leading-snug font-semibold text-foreground">
          {product.name}
        </h3>

        <div className="mt-1.5 flex min-h-[1.25rem] items-center gap-1.5">
          {product.rating != null ? (
            <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
              <span aria-hidden>★</span>
              {product.rating}
            </span>
          ) : null}
          {product.reviewCount != null ? (
            <span className="truncate text-[11px] text-muted-foreground">
              {product.reviewCount} reviews
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-1.5">
              <span className="text-[15px] font-extrabold tabular-nums">
                {formatPaise(product.pricePaise)}
              </span>
              {hasCompare ? (
                <span className="text-[12px] text-muted-foreground line-through tabular-nums">
                  {formatPaise(product.compareAtPaise)}
                </span>
              ) : null}
            </div>
          </div>
          {percentOff > 0 ? (
            <span className="shrink-0 text-[12px] font-bold text-emerald-600">
              {percentOff}% OFF
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

function ProductCardContent({ product, compact }) {
  const [broken, setBroken] = useState(false);
  const src = product.imageUrl ?? product.images?.[0]?.url;

  if (compact) {
    return <CompactProductCardContent product={product} />;
  }

  return (
    <Link
      to={productPath(product)}
      className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-border bg-card transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-muted">
        {src && !broken ? (
          <img
            src={src}
            alt=""
            className="size-full object-cover transition-transform duration-200 group-hover:scale-[1.04]"
            onError={() => setBroken(true)}
          />
        ) : (
          <DecoryImageFallback />
        )}
      </div>
      <div className="flex flex-1 flex-col px-2.5 pt-2.5 pb-3 md:px-[18px] md:pt-4 md:pb-5">
        <h3 className="line-clamp-2 min-h-[2.5em] font-heading text-[13px] leading-tight font-bold tracking-tight md:min-h-[2.6em] md:text-[16.5px] md:leading-snug">
          {product.name}
        </h3>
        <div className="mt-1.5 flex min-h-[1.25rem] items-center gap-1.5 text-[11px] text-muted-foreground md:mt-2 md:min-h-0 md:text-[13px]">
          {product.rating != null ? (
            <span className="font-bold text-amber-800 dark:text-primary">
              ★ {product.rating}
            </span>
          ) : null}
          {product.tag ? (
            <span className="truncate rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-bold text-amber-800 md:px-2.5 md:py-1 md:text-[11px] dark:text-primary">
              {product.tag}
            </span>
          ) : null}
        </div>
        <div className="mt-auto pt-2 text-sm font-extrabold md:text-lg">
          {formatPaise(product.pricePaise)}
        </div>
      </div>
    </Link>
  );
}

export function HomeProductCard({ product, variant = "default" }) {
  const reduce = useReducedMotion();
  const compact = variant === "compact";

  if (compact) {
    return (
      <div className="min-w-0">
        <ProductCardContent product={product} compact />
      </div>
    );
  }

  return (
    <motion.div
      variants={reduce ? undefined : staggerItem}
      whileHover={reduce ? undefined : { y: -4 }}
      transition={{ duration: 0.2 }}
      className="min-w-0"
    >
      <ProductCardContent product={product} compact={false} />
    </motion.div>
  );
}

export function HomeProductCardCompact({ product }) {
  return <HomeProductCard product={product} variant="compact" />;
}

export function HomeProductCardSkeleton({ compact = false }) {
  return (
    <div className="min-w-0">
      <div
        className={cn(
          "flex h-full flex-col overflow-hidden border border-border bg-card",
          compact ? "rounded-2xl" : "rounded-[20px]",
        )}
      >
        <Skeleton className={cn("w-full rounded-none", compact ? "aspect-square" : "aspect-[4/3]")} />
        <div
          className={cn(
            "flex flex-1 flex-col",
            compact ? "px-2.5 pt-2.5 pb-3" : "px-2.5 pt-2.5 pb-3 md:px-[18px] md:pt-4 md:pb-5",
          )}
        >
          <Skeleton className="h-4 w-[88%] rounded-md" />
          <Skeleton className="mt-2 h-4 w-[62%] rounded-md" />
          <div className="mt-2 flex items-center gap-2">
            <Skeleton className="h-5 w-10 rounded-md" />
            <Skeleton className="h-3 w-16 rounded-md" />
          </div>
          <div className="mt-auto flex items-end justify-between pt-2">
            <Skeleton className="h-5 w-20 rounded-md" />
            <Skeleton className="h-4 w-12 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
