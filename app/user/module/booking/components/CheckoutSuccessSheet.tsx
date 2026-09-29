import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { HomeBottomSheetModal } from '@/module/home/components/HomeBottomSheetModal';
import { navigateToAppHome } from '@/lib/navigate-back';
import { type Href, router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { View } from 'react-native';

type CheckoutSuccessSheetProps = {
  visible: boolean;
  orderId: string | null;
  onClose: () => void;
};

export function CheckoutSuccessSheet({ visible, orderId, onClose }: CheckoutSuccessSheetProps) {
  return (
    <HomeBottomSheetModal
      visible={visible}
      onClose={onClose}
      sheetMinHeight={320}
      closeAccessibilityLabel="Close">
      <View className="items-center px-6 pb-2 pt-6">
        <View className="size-16 items-center justify-center rounded-full bg-primary">
          <Icon as={Check} className="text-primary-foreground size-8" />
        </View>
        <Text className="text-foreground mt-4 text-xl font-bold">Order successful!</Text>
        <Text className="text-muted-foreground mt-2 text-center text-sm">
          We&apos;re preparing your setup. See updates in My orders.
        </Text>
        {orderId ? (
          <Text className="text-muted-foreground mt-1 text-xs">Order #{orderId.slice(0, 8)}</Text>
        ) : null}
        <View className="mt-6 w-full gap-2">
          <Button className="rounded-xl bg-foreground" onPress={() => {
            onClose();
            navigateToAppHome();
          }}>
            <Text className="text-background font-semibold">Go home</Text>
          </Button>
          <Button
            variant="secondary"
            className="rounded-xl"
            onPress={() => {
              onClose();
              router.push('/(app)/profile/orders' as Href);
            }}>
            <Text>Track your order</Text>
          </Button>
        </View>
      </View>
    </HomeBottomSheetModal>
  );
}
