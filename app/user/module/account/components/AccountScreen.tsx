import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { getApiError } from '@/api/client';
import { formatIndiaPhoneDisplay } from '@/lib/phone';
import { AccountSubScreen } from '@/module/account/components/AccountSubScreen';
import { LinkPhoneDialog } from '@/module/account/components/LinkPhoneDialog';
import {
  isErrorWithCode,
  linkGoogleAccount,
  statusCodes,
} from '@/module/auth/services/link-google.service';
import { GoogleMark } from '@/module/onboarding/components/GoogleMark';
import { BRAND_NAME } from '@/module/onboarding/lib/onboarding-copy';
import { useAuthStore } from '@/store/auth.store';
import { Href, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

export function AccountScreen() {
  const user = useAuthStore((s) => s.user);
  const resetOnboarding = useAuthStore((s) => s.resetOnboarding);
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const phoneLabel = user?.phone ? formatIndiaPhoneDisplay(user.phone) : '';
  const hasPhone = Boolean(user?.phone?.trim());
  const emailLabel = user?.email?.trim() || '—';
  const googleLinked = Boolean(user?.linkedGoogle);

  async function handleLinkGoogle() {
    setGoogleLoading(true);
    try {
      await linkGoogleAccount();
    } catch (err) {
      if (isErrorWithCode(err) && err.code === statusCodes.SIGN_IN_CANCELLED) {
        return;
      }
      const raw = getApiError(err);
      const message = raw.toLowerCase().includes('already registered')
        ? 'This Google account is already linked to another user.'
        : raw;
      Alert.alert('Could not link Google', message);
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleResetOnboarding() {
    await resetOnboarding();
    router.replace('/(onboarding)/welcome' as Href);
  }

  return (
    <AccountSubScreen title="Account">
      <Text className="text-muted-foreground text-sm">
        Link phone and Google to one {BRAND_NAME} account. Orders stay on this profile.
      </Text>
      <View className="border-border gap-3 rounded-2xl border p-4">
        <View>
          <Text className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Name</Text>
          <Text className="text-foreground mt-1 text-base font-semibold">{user?.name ?? 'Guest'}</Text>
        </View>
        <View className="border-t border-border/70 pt-3">
          <Text className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Phone</Text>
          <View className="mt-1 flex-row items-center justify-between gap-2">
            <Text className="text-foreground flex-1 text-base font-semibold">
              {phoneLabel || 'Not added'}
            </Text>
            {!hasPhone ? (
              <Pressable onPress={() => setPhoneDialogOpen(true)} accessibilityRole="button">
                <Text className="text-foreground text-sm font-semibold underline">Add phone</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
        <View className="border-t border-border/70 pt-3">
          <Text className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Email</Text>
          <Text className="text-foreground mt-1 text-base font-semibold">{emailLabel}</Text>
        </View>
        <View className="border-t border-border/70 pt-3">
          <Text className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Google</Text>
          <View className="mt-1 flex-row items-center justify-between gap-2">
            <Text className="text-foreground flex-1 text-base font-semibold">
              {googleLinked ? 'Connected' : 'Not linked'}
            </Text>
            {!googleLinked ? (
              <Pressable
                onPress={() => void handleLinkGoogle()}
                disabled={googleLoading}
                accessibilityRole="button"
                className="flex-row items-center gap-2">
                <GoogleMark size={18} />
                <Text className="text-foreground text-sm font-semibold underline">
                  {googleLoading ? 'Linking…' : 'Link Google'}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>

      <LinkPhoneDialog open={phoneDialogOpen} onOpenChange={setPhoneDialogOpen} />

      <Button variant="ghost" onPress={() => void handleResetOnboarding()}>
        <Text className="text-muted-foreground">Reset onboarding (dev)</Text>
      </Button>
    </AccountSubScreen>
  );
}
