import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { LogOut } from 'lucide-react-native';
import { Pressable } from 'react-native';

type ProfileLogoutButtonProps = {
  onPress: () => void;
};

export function ProfileLogoutButton({ onPress }: ProfileLogoutButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-center gap-2 rounded-full border border-border bg-card py-3.5 active:bg-muted/40"
      accessibilityRole="button"
      accessibilityLabel="Sign out">
      <Icon as={LogOut} className="text-destructive size-5" />
      <Text className="text-destructive text-base font-semibold">Log out</Text>
    </Pressable>
  );
}
