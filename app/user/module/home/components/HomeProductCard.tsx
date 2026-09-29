import { Text } from '@/components/ui/text';
import { formatPaise } from '@/lib/format-money';
import { discountPercent } from '@/lib/product-price';
import {
  ProductCardInstantBadge,
  ProductCardInstantEta,
} from '@/module/catalog/components/ProductCardInstant';
import type { HomeCatalogProduct } from '@/module/home/lib/home-catalog';
import { Href, router } from 'expo-router';
import { Image } from 'expo-image';
import { cn } from '@/lib/utils';
import { ScalePressable } from '@/components/shell';
import { View } from 'react-native';

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop';

type HomeProductCardProps = {
  product: HomeCatalogProduct;
  badgeLabel?: string | null;
  onPress?: () => void;
  className?: string;
  /** PDP similar rail — parent sets width; tighter padding */
  compact?: boolean;
};

function formatRating(value: number | null | undefined): string | null {
  if (value == null || Number.isNaN(Number(value))) return null;
  const n = Number(value);
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}

function resolveReviewCount(reviewCount: number | null | undefined): number | null {
  const n = reviewCount != null ? Number(reviewCount) : 0;
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function ProductCardRatingReviews({
  ratingLabel,
  reviewCount,
}: {
  ratingLabel: string | null;
  reviewCount: number | null;
}) {
  const positiveCount = resolveReviewCount(reviewCount);
  if (ratingLabel == null && positiveCount == null) return null;
  const countLabel = positiveCount != null ? positiveCount.toLocaleString('en-IN') : null;

  return (
    <View className="min-h-5 min-w-0 flex-1 flex-row items-center gap-1.5">
      {ratingLabel != null ? (
        <View className="rounded-md bg-emerald-600 px-1.5 py-0.5">
          <Text className="text-[11px] font-bold leading-none text-white">★ {ratingLabel}</Text>
        </View>
      ) : null}
      {countLabel != null ? (
        <Text className="text-muted-foreground shrink text-[11px]" numberOfLines={1}>
          {countLabel} {positiveCount === 1 ? 'review' : 'reviews'}
        </Text>
      ) : null}
    </View>
  );
}

/** Fixed-height row — matches web `ProductCardReviewsAndEta` + `reserveSpace`. */
function ProductCardReviewsAndEta({
  ratingLabel,
  reviewCount,
  instant,
}: {
  ratingLabel: string | null;
  reviewCount: number | null;
  instant?: HomeCatalogProduct['instant'];
}) {
  const showEta = Boolean(instant?.enabled && instant.etaMinutes != null);
  const hasReviews =
    ratingLabel != null || resolveReviewCount(reviewCount) != null;

  return (
    <View className="mt-1.5 h-5 flex-row items-center justify-between gap-2">
      <View className="min-w-0 flex-1 flex-row items-center overflow-hidden">
        {hasReviews ? (
          <ProductCardRatingReviews ratingLabel={ratingLabel} reviewCount={reviewCount} />
        ) : null}
      </View>
      {showEta ? <ProductCardInstantEta instant={instant} /> : null}
    </View>
  );
}

function ProductCardPriceBlock({
  pricePaise,
  compareAtPaise,
}: {
  pricePaise: number;
  compareAtPaise?: number | null;
}) {
  const percentOff = discountPercent(pricePaise, compareAtPaise);
  const hasCompare = compareAtPaise != null && compareAtPaise > pricePaise;

  return (
    <View className="mt-2 h-8 flex-row items-end justify-between gap-2">
      <View className="min-w-0 flex-row flex-wrap items-baseline gap-x-1.5">
        <Text className="text-foreground text-[15px] font-extrabold tabular-nums">
          {formatPaise(pricePaise)}
        </Text>
        {hasCompare ? (
          <Text className="text-muted-foreground text-[11px] font-medium line-through tabular-nums">
            {formatPaise(compareAtPaise!)}
          </Text>
        ) : null}
      </View>
      {percentOff > 0 ? (
        <View className="shrink-0 rounded-md bg-emerald-50 px-1.5 py-0.5 dark:bg-emerald-950/40">
          <Text className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
            {percentOff}% OFF
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export function HomeProductCard({
  product,
  badgeLabel,
  onPress,
  className,
  compact,
}: HomeProductCardProps) {
  function handlePress() {
    if (onPress) {
      onPress();
      return;
    }
    router.push(`/(app)/product/${product.id}` as Href);
  }

  const imageUri = product.imageUrl ?? PLACEHOLDER;
  const ratingLabel = formatRating(product.rating);
  const sectionBadge = badgeLabel?.trim();

  return (
    <ScalePressable
      onPress={handlePress}
      haptic
      className={cn(
        'border-border/80 overflow-hidden rounded-2xl border bg-card shadow-sm',
        compact ? 'w-full' : 'w-[168px]',
        className,
      )}
      accessibilityRole="button"
      accessibilityLabel={product.title}>
      <View className="relative aspect-square w-full shrink-0 bg-muted">
        {sectionBadge ? (
          <View className="absolute right-2 top-2 z-10 max-w-[85%] rounded-md bg-amber-500 px-2 py-0.5 shadow-sm">
            <Text className="text-[10px] font-bold text-white" numberOfLines={1}>
              {sectionBadge}
            </Text>
          </View>
        ) : null}
        <ProductCardInstantBadge instant={product.instant} />
        <Image
          source={{ uri: imageUri }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          accessibilityLabel={product.title}
        />
      </View>
      <View className={cn('px-2.5 pt-2.5', compact ? 'pb-2.5' : 'pb-3')}>
        <Text
          className="text-foreground h-[2.35em] text-xs font-semibold leading-snug"
          numberOfLines={2}>
          {product.title}
        </Text>

        <ProductCardReviewsAndEta
          ratingLabel={ratingLabel}
          reviewCount={product.reviewCount}
          instant={product.instant}
        />

        <ProductCardPriceBlock
          pricePaise={product.pricePaise}
          compareAtPaise={product.compareAtPaise}
        />
      </View>
    </ScalePressable>
  );
}
