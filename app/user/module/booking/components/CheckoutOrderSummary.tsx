import { Text } from '@/components/ui/text';
import { formatPaise } from '@/lib/format-money';
import { checkoutLineTitle } from '@/module/booking/lib/checkout-line-title';
import { OrderSummaryRows } from '@/module/booking/components/OrderSummaryRows';
import type { CartSnapshot } from '@/module/booking/lib/cart-types';
import { Image } from 'expo-image';
import { View } from 'react-native';

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop';

type CheckoutOrderSummaryProps = {
  cart: CartSnapshot;
};

export function CheckoutOrderSummary({ cart }: CheckoutOrderSummaryProps) {
  return (
    <View className="gap-4 rounded-2xl border border-border bg-card p-4">
      <Text className="text-foreground text-base font-semibold">Order summary</Text>
      <View className="gap-4">
        {cart.items.map((item) => (
          <View key={item.id} className="flex-row gap-3">
            <Image
              source={{ uri: item.imageUrl || PLACEHOLDER }}
              className="size-16 rounded-lg bg-muted"
              contentFit="cover"
            />
            <View className="min-w-0 flex-1 flex-row justify-between gap-2">
              <Text className="text-foreground flex-1 text-sm font-medium">
                {checkoutLineTitle(item.name)}
              </Text>
              <Text className="text-sm font-semibold text-emerald-700">
                {formatPaise(item.lineTotalPaise)}
              </Text>
            </View>
          </View>
        ))}
      </View>
      <OrderSummaryRows cart={cart} />
    </View>
  );
}
