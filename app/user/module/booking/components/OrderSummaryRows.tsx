import { Text } from '@/components/ui/text';
import { formatPaise } from '@/lib/format-money';
import type { CartSnapshot } from '@/module/booking/lib/cart-types';
import { View } from 'react-native';

type OrderSummaryRowsProps = {
  cart: CartSnapshot;
  showSubtotalWhenNoDiscount?: boolean;
};

export function OrderSummaryRows({ cart, showSubtotalWhenNoDiscount = true }: OrderSummaryRowsProps) {
  const subtotal = cart.subtotalPaise ?? 0;
  const discount = cart.discountPaise ?? 0;
  const total = cart.totalPaise ?? subtotal;

  return (
    <View className="gap-2">
      {showSubtotalWhenNoDiscount || discount > 0 ? (
        <View className="flex-row items-center justify-between">
          <Text className="text-muted-foreground text-sm">Order amount</Text>
          <Text className="text-foreground text-sm tabular-nums">{formatPaise(subtotal)}</Text>
        </View>
      ) : null}
      {discount > 0 ? (
        <View className="flex-row items-center justify-between">
          <Text className="text-muted-foreground text-sm">
            Promo{cart.appliedCoupon?.code ? ` (${cart.appliedCoupon.code})` : ''}
          </Text>
          <Text className="text-sm font-semibold tabular-nums text-emerald-600">
            −{formatPaise(discount)}
          </Text>
        </View>
      ) : null}
      <View className="mt-1 flex-row items-center justify-between border-t border-border/60 pt-3">
        <Text className="text-foreground text-base font-semibold">Total amount</Text>
        <Text className="text-primary text-lg font-bold tabular-nums">{formatPaise(total)}</Text>
      </View>
    </View>
  );
}
