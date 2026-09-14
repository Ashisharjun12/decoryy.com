import { AuthGate } from '@/module/auth/components/AuthGate';
import { getOnboardingAccessRedirect } from '@/module/auth/lib/auth-routing';
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <AuthGate
      resolveRedirect={({ accessToken, user }) => getOnboardingAccessRedirect(accessToken, user)}>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
    </AuthGate>
  );
}
