import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { couponRequiresCity } from '@/module/booking/lib/coupon-eligibility';
import type { CartSnapshot } from '@/module/booking/lib/cart-types';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

type CartPromoSectionProps = {
  cart: CartSnapshot;
  applying: boolean;
  onApply: (code: string) => void;
  onRemove: () => void;
};

export function CartPromoSection({ cart, applying, onApply, onRemove }: CartPromoSectionProps) {
  const [code, setCode] = useState(cart.appliedCoupon?.code ?? '');
  const needsCity = couponRequiresCity(cart);

  useEffect(() => {
    if (cart.appliedCoupon?.code) setCode(cart.appliedCoupon.code);
  }, [cart.appliedCoupon?.code]);

  if (cart.appliedCoupon?.code) {
    return (
      <View className="flex-row items-center justify-between gap-2 rounded-2xl border border-border bg-card px-4 py-3">
        <Text className="text-foreground flex-1 text-sm font-medium">
          Promo {cart.appliedCoupon.code} applied
        </Text>
        <Button variant="outline" size="sm" disabled={applying} onPress={onRemove}>
          <Text className="text-xs">Remove</Text>
        </Button>
      </View>
    );
  }

  return (
    <View className="gap-2">
      <Text className="text-foreground text-sm font-semibold">Promo code</Text>
      <View className="flex-row gap-2">
        <Input
          className="flex-1"
          placeholder="Enter code"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
          editable={!needsCity && !applying}
        />
        <Button
          className="rounded-xl px-4"
          disabled={applying || needsCity || !code.trim()}
          onPress={() => onApply(code.trim())}>
          <Text className="text-primary-foreground font-semibold">Apply</Text>
        </Button>
      </View>
      {needsCity ? (
        <Text className="text-muted-foreground text-xs">Set your city on the bag before applying a coupon.</Text>
      ) : null}
    </View>
  );
}
