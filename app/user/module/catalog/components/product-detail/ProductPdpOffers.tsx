import { ScalePressable } from '@/components/shell';
import { Text } from '@/components/ui/text';
import { CouponOffersRail } from '@/module/promotions/components/CouponOffersRail';
import { useAvailableCoupons } from '@/module/promotions/hooks/use-available-coupons';
import { couponsForPdpDisplay } from '@/module/promotions/lib/pdp-coupon-display';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, View } from 'react-native';

type ProductPdpOffersProps = {
  productId?: string;
  categoryId?: string;
};

export function ProductPdpOffers({ productId, categoryId }: ProductPdpOffersProps) {
  const { coupons, isPending, isError, isEnabled } = useAvailableCoupons({
    productId,
    categoryId,
    scope: 'pdp',
  });

  const visible = useMemo(() => couponsForPdpDisplay(coupons), [coupons]);

  if (!isEnabled) return null;

  if (isPending) {
    return (
      <View className="gap-2 py-2">
        <Text className="text-foreground text-sm font-semibold">Available offers</Text>
        <ActivityIndicator />
      </View>
    );
  }

  if (isError || visible.length === 0) return null;

  function onViewAll() {
    router.push({
      pathname: '/(app)/product/offers',
      params: {
        productId: productId ?? '',
        categoryId: categoryId ?? '',
      },
    });
  }

  return (
    <View className="gap-3">
      <View className="flex-row items-end justify-between gap-2">
        <View className="min-w-0 flex-1">
          <Text className="text-foreground text-sm font-semibold">Available offers</Text>
          <Text className="text-muted-foreground text-xs">
            {visible.length} coupon{visible.length === 1 ? '' : 's'} for this setup
          </Text>
        </View>
        <ScalePressable haptic onPress={onViewAll} accessibilityRole="button">
          <Text className="text-foreground text-sm font-semibold">View all</Text>
        </ScalePressable>
      </View>

      <CouponOffersRail coupons={visible} />
    </View>
  );
}
