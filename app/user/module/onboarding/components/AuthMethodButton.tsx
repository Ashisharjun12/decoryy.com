import { AppSpinner } from '@/components/ui/app-spinner';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { Pressable, type PressableProps, View } from 'react-native';

type AuthMethodButtonProps = PressableProps & {
  label: string;
  icon?: ReactNode;
  loading?: boolean;
  loadingLabel?: string;
};

export function AuthMethodButton({
  label,
  icon,
  loading,
  loadingLabel = 'Loading…',
  disabled,
  className,
  ...props
}: AuthMethodButtonProps) {
  return (
    <Pressable
      disabled={disabled || loading}
      className={cn(
        'h-12 w-full flex-row items-center justify-center gap-2.5 rounded-2xl border border-border bg-background active:bg-muted/50',
        disabled && !loading && 'opacity-60',
        className,
      )}
      accessibilityRole="button"
      accessibilityState={{ busy: loading }}
      {...props}>
      {loading ? (
        <View className="w-full flex-row items-center justify-center gap-2.5">
          <AppSpinner size="sm" />
          <Text className="text-foreground text-[15px] font-semibold">{loadingLabel}</Text>
        </View>
      ) : (
        <View className="flex-row items-center justify-center gap-2.5">
          {icon}
          <Text className="text-foreground text-[15px] font-semibold">{label}</Text>
        </View>
      )}
    </Pressable>
  );
}
