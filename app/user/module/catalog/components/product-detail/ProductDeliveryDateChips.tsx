import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ScalePressable } from '@/components/shell';
import { cn } from '@/lib/utils';
import { addDays, format, startOfToday } from 'date-fns';
import { CalendarDays } from 'lucide-react-native';
import { useMemo } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export type DeliveryDateMode = 'today' | 'tomorrow' | 'later';

type ProductDeliveryDateChipsProps = {
  mode: DeliveryDateMode | null;
  selectedDate: Date;
  onSelectMode: (mode: DeliveryDateMode) => void;
  onOpenLater: () => void;
};

export function ProductDeliveryDateChips({
  mode,
  selectedDate,
  onSelectMode,
  onOpenLater,
}: ProductDeliveryDateChipsProps) {
  const today = useMemo(() => startOfToday(), []);
  const tomorrow = useMemo(() => addDays(today, 1), [today]);

  return (
    <View className="gap-3">
      <Text className="text-foreground text-base font-semibold">Choose delivery date</Text>
      <View className="flex-row gap-2">
        <DateChip
          label="Today"
          sub={format(today, 'do MMM')}
          selected={mode === 'today'}
          onPress={() => {
            onSelectMode('today');
          }}
        />
        <DateChip
          label="Tomorrow"
          sub={format(tomorrow, 'do MMM')}
          selected={mode === 'tomorrow'}
          onPress={() => {
            onSelectMode('tomorrow');
          }}
        />
        <DateChip
          label="Later"
          sub={mode === 'later' ? format(selectedDate, 'do MMM') : 'Pick'}
          selected={mode === 'later'}
          icon
          onPress={onOpenLater}
        />
      </View>
    </View>
  );
}

function DateChip({
  label,
  sub,
  selected,
  onPress,
  icon,
}: {
  label: string;
  sub: string;
  selected: boolean;
  onPress: () => void;
  icon?: boolean;
}) {
  const progress = useSharedValue(selected ? 1 : 0);

  progress.value = withTiming(selected ? 1 : 0, { duration: 180 });

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: progress.value > 0.5 ? '#FACC15' : 'hsl(48 15% 90%)',
    backgroundColor: progress.value > 0.5 ? 'hsl(48 40% 95%)' : 'hsl(0 0% 100%)',
  }));

  return (
    <Animated.View style={[{ flex: 1, borderRadius: 16, borderWidth: 1 }, animatedStyle]}>
      <ScalePressable
        haptic
        onPress={onPress}
        className="items-center rounded-2xl px-2 py-3"
        accessibilityRole="button">
        {icon ? <Icon as={CalendarDays} className="text-muted-foreground mb-1 size-5" /> : null}
        <Text className="text-foreground text-sm font-semibold">{label}</Text>
        <Text className="text-muted-foreground text-xs">{sub}</Text>
      </ScalePressable>
    </Animated.View>
  );
}
