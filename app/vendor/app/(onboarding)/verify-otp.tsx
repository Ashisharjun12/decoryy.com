import { getApiError } from '@/api/client';
import { formatIndiaPhoneDisplay } from '@/lib/phone';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { AuthTopBar } from '@/module/onboarding/components/AuthTopBar';
import { OtpInput } from '@/module/onboarding/components/OtpInput';
import { useSmsOtpAutofill } from '@/module/onboarding/hooks/use-sms-otp-autofill';
import { sendSignInOtp, verifyRegisterOtp, verifySignInOtp } from '@/module/onboarding/services/otp.service';
import { submitVendorRegistration } from '@/module/onboarding/services/register.service';
import { getPostOtpRedirectPath, useAuthStore } from '@/store/auth.store';
import { Href, router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VerifyOtpScreen() {
  const pendingRegistration = useAuthStore((s) => s.pendingRegistration);
  const pendingOtpPhone = useAuthStore((s) => s.pendingOtpPhone);
  const pendingOtpMode = useAuthStore((s) => s.pendingOtpMode);
  const setPendingOtp = useAuthStore((s) => s.setPendingOtp);
  const clearPendingOtp = useAuthStore((s) => s.clearPendingOtp);
  const restoreRegisterDraftFromPending = useAuthStore((s) => s.restoreRegisterDraftFromPending);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const autoVerifyRef = useRef('');
  const otpRequestRef = useRef<string | null>(null);

  const phone = pendingOtpPhone ?? pendingRegistration?.phone;
  const phoneDisplay = phone ? formatIndiaPhoneDisplay(phone) : 'your number';
  const isSignIn = pendingOtpMode === 'sign-in';

  const handleVerify = useCallback(
    async (code: string) => {
      if (!phone || code.length !== 6 || submitting) return;

      setSubmitting(true);
      setError('');
      try {
        const result =
          isSignIn ? await verifySignInOtp(phone, code) : await verifyRegisterOtp(phone, code);
        router.replace(getPostOtpRedirectPath(result.user) as Href);
      } catch (err) {
        autoVerifyRef.current = '';
        setError(getApiError(err));
      } finally {
        setSubmitting(false);
      }
    },
    [phone, isSignIn, submitting]
  );

  const handleOtpAutofill = useCallback((code: string) => {
    setOtp(code);
    setError('');
  }, []);

  useSmsOtpAutofill({ onOtpReceived: handleOtpAutofill });

  useEffect(() => {
    if (!phone || !pendingOtpMode) return;

    const requestKey = `${pendingOtpMode}:${phone}`;
    if (otpRequestRef.current === requestKey) return;
    otpRequestRef.current = requestKey;

    let cancelled = false;
    setSendingOtp(true);
    setError('');

    void (async () => {
      try {
        if (pendingOtpMode === 'sign-in') {
          await sendSignInOtp(phone);
          return;
        }
        if (pendingRegistration) {
          await submitVendorRegistration(pendingRegistration);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiError(err));
          otpRequestRef.current = null;
        }
      } finally {
        if (!cancelled) {
          setSendingOtp(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [phone, pendingOtpMode, pendingRegistration]);

  useEffect(() => {
    if (otp.length !== 6 || submitting || sendingOtp) return;
    if (autoVerifyRef.current === otp) return;
    autoVerifyRef.current = otp;
    void handleVerify(otp);
  }, [otp, submitting, sendingOtp, handleVerify]);

  function handleBack() {
    if (isSignIn) {
      clearPendingOtp();
      router.replace('/(onboarding)/sign-in' as Href);
      return;
    }

    restoreRegisterDraftFromPending();
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(onboarding)/register-location' as Href);
  }

  useFocusEffect(
    useCallback(() => {
      if (!pendingOtpPhone && !pendingRegistration) {
        router.replace('/(onboarding)/register' as Href);
      }
    }, [pendingOtpPhone, pendingRegistration])
  );

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });
    return () => sub.remove();
  }, [isSignIn, pendingRegistration, pendingOtpPhone]);

  async function handleResend() {
    if (!phone || resending || sendingOtp) return;
    setResending(true);
    setError('');
    setOtp('');
    autoVerifyRef.current = '';
    otpRequestRef.current = null;
    try {
      if (isSignIn) {
        await sendSignInOtp(phone);
        setPendingOtp({
          phone,
          mode: 'sign-in',
        });
        return;
      }
      if (pendingRegistration) {
        await submitVendorRegistration(pendingRegistration);
      }
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setResending(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <AuthTopBar onBackPress={handleBack} />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="flex-1 px-8 pt-6">
          <Text className="text-foreground" style={{ fontSize: 32, lineHeight: 38, fontWeight: '700' }}>
            We just sent you an SMS
          </Text>
          <Text className="text-muted-foreground mt-3 text-base leading-6">
            Enter the security code we sent to{'\n'}
            {phoneDisplay}
          </Text>

          <View className="mt-10">
            <OtpInput
              value={otp}
              onChange={(value) => {
                autoVerifyRef.current = '';
                setOtp(value);
                setError('');
              }}
            />
          </View>

          {sendingOtp ? (
            <Text className="text-muted-foreground mt-4 text-sm">Sending verification code…</Text>
          ) : null}

          {error ? <Text className="text-destructive mt-3 text-sm">{error}</Text> : null}

          <Pressable
            className="mt-8 self-start"
            disabled={resending || sendingOtp}
            onPress={() => void handleResend()}>
            <Text className="text-foreground text-sm underline">
              {resending || sendingOtp ? 'Sending code…' : "Didn't receive a code?"}
            </Text>
          </Pressable>

        </View>

        <View className="px-8 pb-10 pt-4">
          <Button
            className="h-12 rounded-2xl"
            disabled={otp.length !== 6 || submitting || sendingOtp}
            onPress={() => void handleVerify(otp)}>
            <Text>{submitting ? 'Verifying…' : 'Continue'}</Text>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
