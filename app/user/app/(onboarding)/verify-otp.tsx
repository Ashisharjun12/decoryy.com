import { Text } from '@/components/ui/text';
import { AuthTopBar } from '@/module/onboarding/components/AuthTopBar';
import { OnboardingButton } from '@/module/onboarding/components/OnboardingButton';
import { OtpInput } from '@/module/onboarding/components/OtpInput';
import { MOCK_OTP } from '@/module/onboarding/lib/onboarding-copy';
import {
  sendSignInOtp,
  verifySignInOtp,
} from '@/module/onboarding/services/mock-otp.service';
import { formatIndiaPhoneDisplay } from '@/lib/phone';
import { useAuthStore } from '@/store/auth.store';
import * as Haptics from 'expo-haptics';
import { Href, router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VerifyOtpScreen() {
  const pendingOtpPhone = useAuthStore((s) => s.pendingOtpPhone);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  useFocusEffect(
    useCallback(() => {
      if (!pendingOtpPhone) {
        router.replace('/(onboarding)/sign-in' as Href);
      }
    }, [pendingOtpPhone]),
  );

  if (!pendingOtpPhone) {
    return null;
  }

  const phone: string = pendingOtpPhone;
  const phoneLabel = formatIndiaPhoneDisplay(phone);

  async function handleVerify() {
    if (otp.length < 6) {
      setError('Enter the 6-digit OTP.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await verifySignInOtp(phone, otp);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(app)/' as Href);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setResendMessage('');
    setError('');
    try {
      await sendSignInOtp(phone);
      setResendMessage('OTP sent (mock).');
    } finally {
      setResending(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <AuthTopBar backHref={'/(onboarding)/sign-in' as Href} />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow px-8 pb-8 pt-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="mb-8 gap-2">
            <Text
              className="text-foreground"
              style={{ fontSize: 32, lineHeight: 38, fontWeight: '700' }}>
              Verify OTP
            </Text>
            <Text className="text-muted-foreground text-base leading-6">
              Enter the code sent to {phoneLabel}.
            </Text>
            <Text className="text-muted-foreground text-xs">
              Dev mock OTP: {MOCK_OTP}
            </Text>
          </View>

          <View className="gap-6">
            <OtpInput value={otp} onChange={(value) => {
              setOtp(value);
              setError('');
            }} />

            {error ? <Text className="text-destructive text-sm">{error}</Text> : null}
            {resendMessage ? (
              <Text className="text-muted-foreground text-sm">{resendMessage}</Text>
            ) : null}

            <OnboardingButton disabled={submitting || otp.length < 6} onPress={handleVerify}>
              <Text>{submitting ? 'Verifying…' : 'Verify'}</Text>
            </OnboardingButton>

            <Pressable
              onPress={handleResend}
              disabled={resending}
              accessibilityRole="button"
              className="self-center py-2">
              <Text className="text-foreground text-sm font-semibold">
                {resending ? 'Sending…' : 'Resend OTP'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
