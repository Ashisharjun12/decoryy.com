import { Text } from '@/components/ui/text';
import { AuthTopBar } from '@/module/onboarding/components/AuthTopBar';
import { IndiaPhoneField } from '@/module/onboarding/components/IndiaPhoneField';
import { OnboardingButton } from '@/module/onboarding/components/OnboardingButton';
import { BRAND_NAME } from '@/module/onboarding/lib/onboarding-copy';
import {
  signInSchema,
  type SignInFormValues,
} from '@/module/onboarding/schemas/sign-in.schema';
import { sendSignInOtp } from '@/module/onboarding/services/mock-otp.service';
import { useAuthStore } from '@/store/auth.store';
import { zodResolver } from '@hookform/resolvers/zod';
import { Href, router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignInScreen() {
  const setPendingOtp = useAuthStore((s) => s.setPendingOtp);
  const [sending, setSending] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    mode: 'onChange',
    defaultValues: { phone: '' },
  });

  async function onSubmit(values: SignInFormValues) {
    setSending(true);
    try {
      setPendingOtp(values.phone);
      await sendSignInOtp(values.phone);
      router.push('/(onboarding)/verify-otp' as Href);
    } finally {
      setSending(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <AuthTopBar backHref={'/(onboarding)/welcome' as Href} />
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
              Sign in
            </Text>
            <Text className="text-muted-foreground text-base leading-6">
              Sign in to book with {BRAND_NAME}.
            </Text>
          </View>

          <View className="gap-6">
            <IndiaPhoneField
              label="Phone number"
              nativeID="signInPhone"
              placeholder="Mobile number"
              control={control}
              name="phone"
              error={errors.phone?.message}
            />

            <OnboardingButton
              disabled={!isValid || sending}
              onPress={handleSubmit(onSubmit)}>
              <Text>{sending ? 'Sending…' : 'Send OTP'}</Text>
            </OnboardingButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
