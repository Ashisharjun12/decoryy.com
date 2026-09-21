import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { productPath } from "@/lib/catalog-path";
import { formatPaise } from "@/lib/money";
import { DecoryImageFallback } from "@/components/decory-image-fallback";
import { Skeleton } from "@/components/ui/skeleton";
import { staggerItem } from "@/lib/motion-variants";
import { discountPercent } from "@/lib/product-price";
import { sectionBadgeAppearance } from "@/lib/section-badge-color";
import { cn } from "@/lib/utils";
import {
  ProductCardInstantBadge,
  ProductCardInstantEta,
} from "@/module/catalog/components/ProductCardInstant";

function formatRating(value) {
  if (value == null || Number.isNaN(Number(value))) return null;
  const n = Number(value);
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}

function ProductCardRatingReviews({
  ratingLabel,
  reviewCount,
  size = "default",
  className,
  noTopMargin = false,
}) {
  if (ratingLabel == null && reviewCount == null) return null;
  const count =
    reviewCount != null ? Number(reviewCount).toLocaleString() : null;
  const reviewSize = size === "rail" ? "text-[11px]" : "text-xs";

  return (
    <div
      className={cn(
        "flex min-h-5 items-center gap-1.5",
        !noTopMargin && "mt-1.5",
        className,
      )}
    >
      {ratingLabel != null ? (
        <span
          className={cn(
            "inline-flex items-center gap-0.5 rounded-md bg-emerald-600 px-1.5 py-0.5 text-[11px] font-bold leading-none text-white",
          )}
        >
          <span aria-hidden>★</span>
          {ratingLabel}
        </span>
      ) : null}
      {count != null ? (
        <span className={cn("truncate text-muted-foreground", reviewSize)}>
          {count} reviews
        </span>
      ) : null}
    </div>
  );
}

function ProductCardReviewsAndEta({
  ratingLabel,
  reviewCount,
  instant,
  size = "rail",
}) {
  const showEta = Boolean(instant?.enabled && instant.etaMinutes != null);
  const hasReviews = ratingLabel != null || reviewCount != null;
  if (!hasReviews && !showEta) return null;

  return (
    <div className="mt-1.5 flex min-h-5 items-center justify-between gap-2">
      <div className="min-w-0 flex-1">
        {hasReviews ? (
          <ProductCardRatingReviews
            size={size}
            ratingLabel={ratingLabel}
            reviewCount={reviewCount}
            noTopMargin
          />
        ) : null}
      </div>
      {showEta ? (
        <ProductCardInstantEta instant={instant} size={size} className="shrink-0 translate-y-0" />
      ) : null}
    </div>
  );
}

function ProductCardPriceBlock({ pricePaise, compareAtPaise, size = "default" }) {
  const percentOff = discountPercent(pricePaise, compareAtPaise);
  const hasCompare = compareAtPaise != null && compareAtPaise > pricePaise;
  const priceClass =
    size === "rail"
      ? "text-[15px] font-extrabold tracking-tight sm:text-[17px]"
      : "text-base font-extrabold tracking-tight sm:text-lg";
  const mrpClass =
    size === "rail"
      ? "text-[11px] sm:text-xs"
      : "text-xs sm:text-[13px]";
  const offClass =
    size === "rail" ? "text-[11px] px-1.5 py-0.5" : "text-xs px-2 py-0.5";

  return (
    <div className="mt-auto pt-2">
      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          {hasCompare ? (
            <span className="sr-only">
              Sale price {formatPaise(pricePaise)}, was {formatPaise(compareAtPaise)}
            </span>
          ) : null}
          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
            <span
              className={cn("tabular-nums text-foreground", priceClass)}
              aria-hidden={hasCompare ? true : undefined}
            >
              {formatPaise(pricePaise)}
            </span>
            {hasCompare ? (
              <span
                className={cn(
                  "font-medium text-muted-foreground line-through tabular-nums",
                  mrpClass,
                )}
                aria-hidden
              >
                {formatPaise(compareAtPaise)}
              </span>
            ) : null}
          </div>
        </div>
        {percentOff > 0 ? (
          <span
            className={cn(
              "shrink-0 rounded-md bg-emerald-50 font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
              offClass,
            )}
          >
            {percentOff}% OFF
          </span>
        ) : null}
      </div>
    </div>
  );
}

function CompactProductCardContent({ product }) {
  const [broken, setBroken] = useState(false);
  const src = product.imageUrl ?? product.images?.[0]?.url;
  const ratingLabel = formatRating(product.rating);

  return (
    <Link
      to={productPath(product)}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-[box-shadow,border-color] duration-200 hover:border-border hover:shadow-md"
    >
      <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-t-2xl bg-muted">
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
      <div className="flex flex-1 flex-col px-3 pb-3 pt-2.5">
        <h3 className="line-clamp-2 min-h-[2.5em] text-[13px] leading-snug font-semibold tracking-tight text-foreground">
          {product.name}
        </h3>

        <ProductCardReviewsAndEta
          size="default"
          ratingLabel={ratingLabel}
          reviewCount={product.reviewCount}
          instant={product.instant}
        />

        <ProductCardPriceBlock
          pricePaise={product.pricePaise}
          compareAtPaise={product.compareAtPaise}
        />
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

function SectionProductBadge({ label, color }) {
  if (!label?.trim()) return null;
  const { className, style } = sectionBadgeAppearance(color);
  return (
    <span
      className={cn(
        "absolute top-2 right-2 z-1 max-w-[85%] truncate rounded-md px-2 py-0.5 text-[10px] font-bold leading-tight shadow-sm sm:text-[11px]",
        className,
      )}
      style={style}
    >
      {label}
    </span>
  );
}

function RailProductCardContent({ product, badgeLabel, badgeColor }) {
  const [broken, setBroken] = useState(false);
  const src = product.imageUrl ?? product.images?.[0]?.url;
  const ratingLabel = formatRating(product.rating);

  return (
    <Link
      to={productPath(product)}
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-[box-shadow,border-color] duration-200 hover:border-border hover:shadow-md"
    >
      <div className="relative aspect-[5/4] w-full shrink-0 overflow-hidden rounded-t-2xl bg-muted">
        <SectionProductBadge label={badgeLabel} color={badgeColor} />
        <ProductCardInstantBadge instant={product.instant} />
        {src && !broken ? (
          <img
            src={src}
            alt=""
            className="size-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            onError={() => setBroken(true)}
          />
        ) : (
          <DecoryImageFallback />
        )}
      </div>
      <div className="flex flex-1 flex-col px-2.5 pb-3 pt-2.5 sm:px-3">
        <h3 className="line-clamp-2 min-h-[2.35em] text-xs font-semibold leading-snug tracking-tight text-foreground sm:text-[13px]">
          {product.name}
        </h3>

        <ProductCardReviewsAndEta
          size="rail"
          ratingLabel={ratingLabel}
          reviewCount={product.reviewCount}
          instant={product.instant}
        />

        <ProductCardPriceBlock
          size="rail"
          pricePaise={product.pricePaise}
          compareAtPaise={product.compareAtPaise}
        />
      </div>
    </Link>
  );
}

export function HomeProductCardRail({ product, badgeLabel, badgeColor }) {
  return (
    <div className="min-w-0">
      <RailProductCardContent
        product={product}
        badgeLabel={badgeLabel}
        badgeColor={badgeColor}
      />
    </div>
  );
}

export function HomeProductCardRailSkeleton() {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
      <Skeleton className="aspect-[5/4] w-full rounded-none" />
      <div className="flex flex-col px-2.5 pb-3 pt-2.5 sm:px-3">
        <Skeleton className="h-3.5 w-[88%] rounded-md" />
        <Skeleton className="mt-1.5 h-3.5 w-[62%] rounded-md" />
        <div className="mt-1.5 flex items-center gap-1.5">
          <Skeleton className="h-5 w-10 rounded-md" />
          <Skeleton className="h-3 w-16 rounded-md" />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <Skeleton className="h-5 w-[4.5rem] rounded-md" />
          <Skeleton className="h-5 w-12 rounded-md" />
        </div>
      </div>
    </div>
  );
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
