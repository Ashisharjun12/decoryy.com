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
  const name = user?.name ?? 'Guest';
  const phoneLabel = user?.phone ? formatIndiaPhoneDisplay(user.phone) : '';

  return (
    <Pressable
      onPress={() => router.push('/(app)/profile/account' as Href)}
      className="flex-row items-center gap-3 px-4 py-4 active:bg-muted/40"
      accessibilityRole="button"
      accessibilityLabel="Open account details">
      <Avatar alt={name} className="size-12">
        <AvatarFallback>
          <Icon as={UserRound} className="text-muted-foreground size-6" />
        </AvatarFallback>
      </Avatar>
      <View className="min-w-0 flex-1">
        <Text className="text-foreground text-base font-bold" numberOfLines={1}>{name}</Text>
        {phoneLabel ? (
          <Text className="text-muted-foreground mt-0.5 text-sm" numberOfLines={1}>
            {phoneLabel}
          </Text>
        ) : (
          <Text className="text-muted-foreground mt-0.5 text-sm">View account</Text>
        )}
      </View>
      <Icon as={ChevronRight} className="text-muted-foreground size-5 shrink-0" />
    </Pressable>
  );
}
