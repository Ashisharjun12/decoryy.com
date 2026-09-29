import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { formatPaise } from '@/lib/format-money';
import { View } from 'react-native';

type CartProceedBarProps = {
  totalPaise: number;
  disabled?: boolean;
  onPress: () => void;
};

export function CartProceedBar({ totalPaise, disabled, onPress }: CartProceedBarProps) {
  return (
    <View className="border-t border-border bg-background px-1 pt-3">
      <Button className="h-12 rounded-xl bg-foreground" disabled={disabled} onPress={onPress}>
        <Text className="text-background text-base font-bold">
          Proceed to checkout · {formatPaise(totalPaise)}
        </Text>
      </Button>
    </View>
  );
}
