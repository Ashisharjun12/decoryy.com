import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react-native';
import { ChevronRight } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

type ProfileMenuRowProps = {
  label: string;
  icon?: LucideIcon;
  iconSlot?: ReactNode;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
  isLast?: boolean;
};

export function ProfileMenuRow({
  label,
  icon,
  iconSlot,
  subtitle,
  onPress,
  showChevron = true,
  isLast = false,
}: ProfileMenuRowProps) {
  return (
    <View className={cn(!isLast && 'border-b border-border/60')}>
      <Pressable
        onPress={onPress}
        className="flex-row items-center gap-3 px-4 py-3.5 active:bg-muted/40"
        accessibilityRole="button">
        <View className="size-9 items-center justify-center rounded-full bg-muted/60">
          {iconSlot ?? (icon ? <Icon as={icon} className="text-foreground size-[18px]" /> : null)}
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-foreground text-base font-medium">{label}</Text>
          {subtitle ? <Text className="text-muted-foreground mt-0.5 text-sm">{subtitle}</Text> : null}
        </View>
        {showChevron ? <Icon as={ChevronRight} className="text-muted-foreground size-5 shrink-0" /> : null}
      </Pressable>
    </View>
  );
}
