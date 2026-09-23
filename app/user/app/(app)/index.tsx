import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { formatIndiaPhoneDisplay } from '@/lib/phone';
import { BRAND_NAME } from '@/module/onboarding/lib/onboarding-copy';
import { useAuthStore } from '@/store/auth.store';
import { Href, router } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomePlaceholderScreen() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const resetOnboarding = useAuthStore((s) => s.resetOnboarding);

  async function handleSignOut() {
    await signOut();
    router.replace('/(onboarding)/sign-in' as Href);
  }

  async function handleResetOnboarding() {
    await resetOnboarding();
    router.replace('/(onboarding)/welcome' as Href);
  }

  const phoneLabel = user?.phone ? formatIndiaPhoneDisplay(user.phone) : '';

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center gap-6 px-8">
        <View className="gap-2">
          <Text
            className="text-foreground"
            style={{ fontSize: 28, lineHeight: 34, fontWeight: '700' }}>
            {BRAND_NAME}
          </Text>
          <Text className="text-muted-foreground text-base leading-6">
            Hi {user?.name ?? 'there'}
            {phoneLabel ? ` · ${phoneLabel}` : ''}
          </Text>
          <Text className="text-muted-foreground text-sm">Home UI coming next.</Text>
        </View>

        <View className="gap-3">
          <Button variant="outline" onPress={handleSignOut}>
            <Text>Sign out</Text>
          </Button>
          <Button variant="ghost" onPress={handleResetOnboarding}>
            <Text className="text-muted-foreground">Reset onboarding (dev)</Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
