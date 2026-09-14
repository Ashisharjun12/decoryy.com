import { getAuthRedirectPath } from '@/module/auth/lib/auth-routing';
import { useAuthStore } from '@/store/auth.store';
import { Href, Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const hasSeenWelcome = useAuthStore((s) => s.hasSeenWelcome);
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  const href = getAuthRedirectPath({ hydrated, hasSeenWelcome, accessToken, user });

  if (!href) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  return <Redirect href={href as Href} />;
}
