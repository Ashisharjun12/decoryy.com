import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ScalePressable } from '@/components/shell';
import { TIME_SLOTS } from '@/module/catalog/lib/time-slots';
import { cn } from '@/lib/utils';
import { Flame } from 'lucide-react-native';
import { View } from 'react-native';

type ProductDeliverySlotPickerProps = {
  slotId: string;
  onSlotChange: (slotId: string) => void;
};

export function ProductDeliverySlotPicker({ slotId, onSlotChange }: ProductDeliverySlotPickerProps) {
  return (
    <View className="gap-2">
      <Text className="text-muted-foreground text-xs font-medium uppercase">Select time</Text>
      <View className="flex-row flex-wrap gap-2">
        {TIME_SLOTS.map((item) => {
          const selected = slotId === item.id;
          return (
            <ScalePressable
              key={item.id}
              haptic
              onPress={() => onSlotChange(item.id)}
              className={cn(
                'min-w-[30%] flex-1 items-center rounded-2xl border px-1 py-2.5',
                selected ? 'border-primary bg-primary' : 'border-border bg-background',
              )}
              accessibilityRole="button">
              <Text
                className={cn(
                  'text-center text-[11px] font-semibold',
                  selected ? 'text-primary-foreground' : 'text-foreground',
                )}>
                {item.label}
              </Text>
              {'fillingFast' in item && item.fillingFast ? (
                <View
                  className={cn(
                    'mt-1 flex-row items-center gap-0.5 rounded-full px-1.5 py-0.5',
                    selected ? 'bg-white/20' : 'bg-rose-600',
                  )}>
                  <Icon
                    as={Flame}
                    className={cn('size-2.5', selected ? 'text-primary-foreground' : 'text-white')}
                  />
                  <Text
                    className={cn(
                      'text-[8px] font-bold uppercase',
                      selected ? 'text-primary-foreground' : 'text-white',
                    )}>
                    Fast
                  </Text>
                </View>
              ) : null}
            </ScalePressable>
          );
        })}
      </View>
    </View>
  );
}
