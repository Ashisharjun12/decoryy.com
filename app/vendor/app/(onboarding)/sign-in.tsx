import { getApiError } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { AuthTopBar } from '@/module/onboarding/components/AuthTopBar';
import { IndiaPhoneField } from '@/module/onboarding/components/IndiaPhoneField';
import {
  signInSchema,
  type SignInFormValues,
} from '@/module/onboarding/schemas/sign-in.schema';
import { useAuthStore } from '@/store/auth.store';
import { zodResolver } from '@hookform/resolvers/zod';
import { Href, router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignInScreen() {
  const setPendingOtp = useAuthStore((s) => s.setPendingOtp);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    mode: 'onChange',
    defaultValues: { phone: '' },
  });

  function onSubmit(values: SignInFormValues) {
    setPendingOtp({
      phone: values.phone,
      mode: 'sign-in',
    });
    router.push('/(onboarding)/verify-otp' as Href);
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <AuthTopBar backHref={'/(onboarding)/register' as Href} />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="flex-1 px-8 pt-4">
          <View className="mb-10 gap-2">
            <Text className="text-foreground" style={{ fontSize: 32, lineHeight: 38, fontWeight: '700' }}>
              Sign in
            </Text>
            <Text className="text-muted-foreground text-base leading-6">
              Enter your registered phone number. We&apos;ll send you a code.
            </Text>
          </View>

          <IndiaPhoneField
            label="Phone number"
            nativeID="signInPhone"
            placeholder="Mobile number"
            control={control}
            name="phone"
            error={errors.phone?.message}
          />
        </View>

        <View className="px-8 pb-10 pt-4">
          <Button
            className="h-12 rounded-2xl"
            disabled={!isValid || isSubmitting}
            onPress={handleSubmit(onSubmit)}>
            <Text>Send OTP</Text>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
