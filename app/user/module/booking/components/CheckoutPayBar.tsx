import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { formatPaise } from '@/lib/format-money';
import { View } from 'react-native';

type CheckoutPayBarProps = {
  totalPaise: number;
  placing: boolean;
  disabled: boolean;
  onPress: () => void;
};

export function CheckoutPayBar({ totalPaise, placing, disabled, onPress }: CheckoutPayBarProps) {
  return (
    <View className="border-t border-border bg-background pt-3">
      <Button
        className="h-12 rounded-xl bg-foreground"
        disabled={disabled || placing}
        onPress={onPress}>
        <Text className="text-background text-base font-bold">
          {placing ? 'Placing order…' : `Pay now · ${formatPaise(totalPaise)}`}
        </Text>
      </Button>
    </View>
  );
}
