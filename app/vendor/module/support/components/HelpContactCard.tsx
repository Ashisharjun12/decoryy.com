import { PressableScale } from '@/components/motion';
import { triggerHaptic } from '@/components/motion/haptics';
import { Surface } from '@/components/shell';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import * as Haptics from 'expo-haptics';
import type { LucideIcon } from 'lucide-react-native';
import { Copy } from 'lucide-react-native';
import { View } from 'react-native';

type Props = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  hint?: string;
  disabled?: boolean;
  onPress: () => void;
  onCopy?: () => void;
};

export function HelpContactCard({
  icon,
  title,
  subtitle,
  hint,
  disabled,
  onPress,
  onCopy,
}: Props) {
  return (
    <Surface className="overflow-hidden p-0">
      <PressableScale
        disabled={disabled}
        onPress={() => {
          if (disabled) return;
          triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        className="flex-row items-center gap-3 px-4 py-4">
        <View className="size-11 items-center justify-center rounded-2xl bg-primary/12">
          <Icon as={icon} className="text-primary size-5" />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-foreground text-base font-semibold">{title}</Text>
          <Text className="text-muted-foreground mt-0.5 text-sm" numberOfLines={2}>
            {subtitle}
          </Text>
          {hint ? (
            <Text className="text-muted-foreground mt-1 text-xs">{hint}</Text>
          ) : null}
        </View>
        {onCopy ? (
          <PressableScale
            onPress={() => {
              triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
              onCopy();
            }}
            className="size-10 items-center justify-center rounded-full bg-muted">
            <Icon as={Copy} className="text-muted-foreground size-4" />
          </PressableScale>
        ) : null}
      </PressableScale>
    </Surface>
  );
}
