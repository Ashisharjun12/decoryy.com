import { useAuthStore } from '@/store/auth.store';
import { ActivityIndicator, View } from 'react-native';
import { Redirect, type Href } from 'expo-router';

type AuthGateProps = {
  resolveRedirect: (input: {
    hydrated: boolean;
    hasSeenWelcome: boolean;
    accessToken: string | null;
    user: ReturnType<typeof useAuthStore.getState>['user'];
  }) => Href | null;
  children: React.ReactNode;
};

export function AuthGate({ resolveRedirect, children }: AuthGateProps) {
  const hydrated = useAuthStore((s) => s.hydrated);
  const hasSeenWelcome = useAuthStore((s) => s.hasSeenWelcome);
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  if (!hydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  const redirect = resolveRedirect({ hydrated, hasSeenWelcome, accessToken, user });
  if (redirect) {
    return <Redirect href={redirect} />;
  }

  return children;
}
