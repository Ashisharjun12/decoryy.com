import { Screen, TabScreenTitle } from '@/components/shell';
import { SmoothScrollView } from '@/components/shell/SmoothScrollView';
import { Text } from '@/components/ui/text';
import { getApiError } from '@/api/client';
import { useGoBack } from '@/lib/use-go-back';
import { CartLineCard } from '@/module/booking/components/CartLineCard';
import { CartProceedBar } from '@/module/booking/components/CartProceedBar';
import { CartPromoSection } from '@/module/booking/components/CartPromoSection';
import { OrderSummaryRows } from '@/module/booking/components/OrderSummaryRows';
import { useCartData, useCartMutations, useCartQuery } from '@/module/booking/hooks/use-cart-query';
import { proceedToCheckout } from '@/module/booking/lib/proceed-to-checkout';
import { useAuthStore } from '@/store/auth.store';
import { type Href, router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function CartScreen() {
  const user = useAuthStore((s) => s.user);
  const onBack = useGoBack();
  const insets = useSafeAreaInsets();
  const { cart, isLoading } = useCartData();
  useCartQuery(Boolean(user));
  const { patchQty, remove, applyCoupon, clearCoupon } = useCartMutations();

  useEffect(() => {
    if (!user) {
      router.replace('/(onboarding)/login' as Href);
    }
  }, [user]);

  const hasItems = cart.items.length > 0;
  const busy = patchQty.isPending || remove.isPending;

  function onProceed() {
    if (!proceedToCheckout(user)) return;
    router.push('/(app)/checkout' as Href);
  }

  return (
    <Screen edges={['top', 'left', 'right']} gutter contentClassName="flex-1">
      <TabScreenTitle
        title={hasItems ? `My bag (${cart.itemCount})` : 'My bag'}
        showBack
        onBack={onBack}
        insetFromParentGutter
      />
      {isLoading && !hasItems ? (
        <ActivityIndicator className="mt-10" />
      ) : !hasItems ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-foreground text-center text-lg font-semibold">No products added</Text>
          <Text className="text-muted-foreground mt-2 text-center text-sm">
            Pick a setup from the catalog and it will show up here.
          </Text>
        </View>
      ) : (
        <>
          <SmoothScrollView
            className="flex-1"
            contentContainerClassName="gap-4 pb-4 pt-2"
            contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}>
            {cart.items.map((item) => (
              <CartLineCard
                key={item.id}
                item={item}
                scheduledAt={cart.scheduledAt}
                busy={busy}
                onIncrement={() => {
                  void patchQty.mutateAsync({ id: item.id, quantity: (item.quantity ?? 1) + 1 }).catch(
                    (e) => Alert.alert('Could not update', getApiError(e)),
                  );
                }}
                onDecrement={() => {
                  const next = Math.max(1, (item.quantity ?? 1) - 1);
                  void patchQty.mutateAsync({ id: item.id, quantity: next }).catch((e) =>
                    Alert.alert('Could not update', getApiError(e)),
                  );
                }}
                onRemove={() => {
                  void remove.mutateAsync(item.id).catch((e) =>
                    Alert.alert('Could not remove', getApiError(e)),
                  );
                }}
              />
            ))}
            <CartPromoSection
              cart={cart}
              applying={applyCoupon.isPending || clearCoupon.isPending}
              onApply={(code) => {
                void applyCoupon.mutateAsync(code).catch((e) =>
                  Alert.alert('Promo failed', getApiError(e)),
                );
              }}
              onRemove={() => {
                void clearCoupon.mutateAsync().catch((e) =>
                  Alert.alert('Could not remove promo', getApiError(e)),
                );
              }}
            />
            <View className="rounded-2xl border border-border bg-card p-4">
              <OrderSummaryRows cart={cart} />
            </View>
          </SmoothScrollView>
          <View className="absolute inset-x-0 bottom-0 px-5" style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
            <CartProceedBar totalPaise={cart.totalPaise} disabled={busy} onPress={onProceed} />
          </View>
        </>
      )}
    </Screen>
  );
}
