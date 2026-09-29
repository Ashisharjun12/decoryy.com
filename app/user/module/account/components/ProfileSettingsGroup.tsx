import { Text } from '@/components/ui/text';
import type { ReactNode } from 'react';
import { View } from 'react-native';

type ProfileSettingsGroupProps = {
  title?: string;
  children: ReactNode;
};

export function ProfileSettingsGroup({ title, children }: ProfileSettingsGroupProps) {
  return (
    <View className="gap-2">
      {title ? (
        <Text className="text-muted-foreground px-1 text-xs font-semibold uppercase tracking-wide">
          {title}
        </Text>
      ) : null}
      <View className="overflow-hidden rounded-2xl border border-border/80 bg-card">{children}</View>
    </View>
  );
}
