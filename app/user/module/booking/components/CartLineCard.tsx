import { ScalePressable } from '@/components/shell';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { formatPaise } from '@/lib/format-money';
import { checkoutLineTitle } from '@/module/booking/lib/checkout-line-title';
import type { CartItemLine } from '@/module/booking/lib/cart-types';
import { format } from 'date-fns';
import { Image } from 'expo-image';
import { Minus, Plus, Trash2 } from 'lucide-react-native';
import { View } from 'react-native';

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop';

type CartLineCardProps = {
  item: CartItemLine;
  scheduledAt?: string | null;
  busy?: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
};

function formatCartSlot(iso: string | null | undefined) {
  if (!iso) return null;
  try {
    return format(new Date(iso), 'EEE d MMM, h a');
  } catch {
    return null;
  }
}

export function CartLineCard({
  item,
  scheduledAt,
  busy,
  onIncrement,
  onDecrement,
  onRemove,
}: CartLineCardProps) {
  const qty = item.quantity ?? 1;
  const slotLabel = formatCartSlot(scheduledAt);
  const src = item.imageUrl || PLACEHOLDER;

  return (
    <View className="flex-row gap-3 rounded-2xl border border-border bg-card p-3">
      <Image source={{ uri: src }} className="size-[5.5rem] rounded-xl bg-muted" contentFit="cover" />
      <View className="min-w-0 flex-1">
        <Text className="text-foreground text-sm font-semibold leading-snug">
          {checkoutLineTitle(item.name)}
        </Text>
        {slotLabel ? (
          <Text className="text-muted-foreground mt-1 text-xs">Slot: {slotLabel}</Text>
        ) : null}
        {item.addons?.length ? (
          <Text className="text-muted-foreground mt-1 text-xs" numberOfLines={2}>
            Add-ons: {item.addons.map((a) => a.name).join(', ')}
          </Text>
        ) : null}
        <Text className="mt-2 text-sm font-semibold text-emerald-700">
          {formatPaise(item.lineTotalPaise)}
        </Text>
        <View className="mt-2 flex-row items-center justify-between">
          <View className="flex-row items-center rounded-full border border-border bg-muted/40 p-0.5">
            <ScalePressable
              haptic
              disabled={busy}
              onPress={onDecrement}
              className="size-8 items-center justify-center">
              <Icon as={Minus} className="size-4" />
            </ScalePressable>
            <Text className="min-w-[1.5rem] text-center text-sm font-bold">{qty}</Text>
            <ScalePressable
              haptic
              disabled={busy}
              onPress={onIncrement}
              className="size-8 items-center justify-center">
              <Icon as={Plus} className="size-4" />
            </ScalePressable>
          </View>
          <ScalePressable haptic disabled={busy} onPress={onRemove} className="p-2">
            <Icon as={Trash2} className="text-muted-foreground size-4" />
          </ScalePressable>
        </View>
      </View>
    </View>
  );
}
