import { Text } from '@/components/ui/text';
import { HomeProductCard } from '@/module/home/components/HomeProductCard';
import type { HomeCatalogProduct } from '@/module/home/lib/home-catalog';
import { cn } from '@/lib/utils';
import { ScrollView, View } from 'react-native';

/** Match `HomeProductCard` rail width on home feed */
const PDP_RAIL_CARD_WIDTH = 168;

type ProductPdpProductRailProps = {
  title: string;
  subtitle: string;
  items: HomeCatalogProduct[];
  loading?: boolean;
  /** Tighter top spacing when this rail follows another PDP product rail */
  stackedBelowRail?: boolean;
  className?: string;
};

function sectionSpacingClass(stackedBelowRail?: boolean) {
  return stackedBelowRail
    ? 'mt-4 gap-3 border-t border-border/60 pt-5'
    : 'gap-3 border-t border-border/60 pt-8';
}

export function ProductPdpProductRail({
  title,
  subtitle,
  items,
  loading,
  stackedBelowRail,
  className,
}: ProductPdpProductRailProps) {
  if (loading) {
    return (
      <View className={cn(sectionSpacingClass(stackedBelowRail), className)}>
        <Text className="text-foreground text-lg font-semibold">{title}</Text>
        <View
          className="h-[248px] rounded-2xl bg-muted"
          style={{ width: PDP_RAIL_CARD_WIDTH }}
        />
      </View>
    );
  }

  if (!items.length) return null;

  return (
    <View className={cn(sectionSpacingClass(stackedBelowRail), className)}>
      <View className="gap-0.5">
        <Text className="text-foreground text-lg font-semibold">{title}</Text>
        <Text className="text-muted-foreground text-sm">{subtitle}</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-3 pr-1">
        {items.map((product) => (
          <View key={product.id} style={{ width: PDP_RAIL_CARD_WIDTH }}>
            <HomeProductCard product={product} compact />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
