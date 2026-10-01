import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { formatIndiaPhoneDisplay } from '@/lib/phone';
import { useAuthStore } from '@/store/auth.store';
import { Href, router } from 'expo-router';
import { ChevronRight, UserRound } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

export function ProfileHeaderCard() {
  const user = useAuthStore((s) => s.user);
  const name = user?.name?.trim() || 'Account';
  const phoneLabel = user?.phone?.trim() ? formatIndiaPhoneDisplay(user.phone) : '';
  const emailLabel = user?.email?.trim() ?? '';
  const subtitle = phoneLabel || emailLabel || 'Personal details';

  return (
    <Pressable
      onPress={() => router.push('/(app)/profile/account' as Href)}
      className="flex-row items-center gap-4 rounded-2xl py-2 active:opacity-80"
      accessibilityRole="button"
      accessibilityLabel="Open account details">
      <Avatar alt={name} className="size-16 border-2 border-background shadow-sm">
        <AvatarFallback className="bg-muted">
          <Icon as={UserRound} className="text-muted-foreground size-7" />
        </AvatarFallback>
      </Avatar>
      <View className="min-w-0 flex-1">
        <Text className="text-foreground text-xl font-bold tracking-tight" numberOfLines={1}>
          {name}
        </Text>
        <Text className="text-muted-foreground mt-1 text-sm" numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <Icon as={ChevronRight} className="text-muted-foreground/70 size-5 shrink-0" />
    </Pressable>
  );
}
