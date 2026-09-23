import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { StyleProp, ViewStyle } from 'react-native';

export const ONBOARDING_BUTTON_RADIUS = 16;

const radiusStyle: ViewStyle = { borderRadius: ONBOARDING_BUTTON_RADIUS };

export function OnboardingButton({
  className,
  style,
  ...props
}: ButtonProps) {
  return (
    <Button
      className={cn('h-12 rounded-2xl', className)}
      style={[radiusStyle, style as StyleProp<ViewStyle>]}
      {...props}
    />
  );
}
