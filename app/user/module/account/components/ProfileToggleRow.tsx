import { Icon } from '@/components/ui/icon';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

type ProfileToggleRowProps = {
  label: string;
  icon: LucideIcon;
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
  isLast?: boolean;
};

export function ProfileToggleRow({
  label,
  icon,
  value,
  onValueChange,
  disabled = false,
  isLast = false,
}: ProfileToggleRowProps) {
  return (
    <View className={cn(!isLast && 'border-b border-border/60')}>
      <View className="flex-row items-center gap-3 px-4 py-3.5">
        <View className="size-9 items-center justify-center rounded-full bg-muted/60">
          <Icon as={icon} className="text-foreground size-[18px]" />
        </View>
        <Text className="text-foreground min-w-0 flex-1 text-base font-medium">{label}</Text>
        <Switch checked={value} onCheckedChange={onValueChange} disabled={disabled} />
      </View>
    </View>
  );
}
