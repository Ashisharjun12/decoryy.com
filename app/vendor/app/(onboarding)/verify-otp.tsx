import { getApiError } from '@/api/client';
import { formatIndiaPhoneDisplay } from '@/lib/phone';
import { OnboardingButton } from '@/module/onboarding/components/OnboardingButton';
import { Text } from '@/components/ui/text';
import { AuthTopBar } from '@/module/onboarding/components/AuthTopBar';
import { OtpInput } from '@/module/onboarding/components/OtpInput';
import { useSmsOtpAutofill } from '@/module/onboarding/hooks/use-sms-otp-autofill';
import { sendSignInOtp, verifyRegisterOtp, verifySignInOtp } from '@/module/onboarding/services/otp.service';
import { submitVendorRegistration } from '@/module/onboarding/services/register.service';
import { getPostOtpRedirectPath, useAuthStore } from '@/store/auth.store';
import { Href, router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VerifyOtpScreen() {
  const pendingRegistration = useAuthStore((s) => s.pendingRegistration);
  const pendingOtpPhone = useAuthStore((s) => s.pendingOtpPhone);
  const pendingOtpMode = useAuthStore((s) => s.pendingOtpMode);
  const pendingLoginIntent = useAuthStore((s) => s.pendingLoginIntent);
  const registerOtpRequested = useAuthStore((s) => s.registerOtpRequested);
  const setPendingOtp = useAuthStore((s) => s.setPendingOtp);
  const clearPendingOtp = useAuthStore((s) => s.clearPendingOtp);
  const restoreRegisterDraftFromPending = useAuthStore((s) => s.restoreRegisterDraftFromPending);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpReady, setOtpReady] = useState(false);
  const autoVerifyRef = useRef('');
  const otpSendRef = useRef(0);

  const phone = pendingOtpPhone ?? pendingRegistration?.phone;
  const phoneDisplay = phone ? formatIndiaPhoneDisplay(phone) : 'your number';
  const isSignIn = pendingOtpMode === 'sign-in';

  const handleVerify = useCallback(
    async (code: string) => {
      if (!phone || code.length !== 6 || submitting || !otpReady) return;

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
    [phone, isSignIn, submitting, otpReady],
  );

  const handleOtpAutofill = useCallback((code: string) => {
    setOtp(code);
    setError('');
  }, []);

  useSmsOtpAutofill({ onOtpReceived: handleOtpAutofill });

  useEffect(() => {
    if (!phone || !pendingOtpMode) return;

    if (pendingOtpMode === 'register' && registerOtpRequested) {
      setOtpReady(true);
      return;
    }

    const sendId = ++otpSendRef.current;
    let cancelled = false;
    setSendingOtp(true);
    setOtpReady(false);
    setError('');

    void (async () => {
      try {
        if (pendingOtpMode === 'sign-in') {
          await sendSignInOtp(phone);
        } else {
          const registration = useAuthStore.getState().pendingRegistration;
          if (!registration) {
            throw new Error('Registration details missing. Go back and try again.');
          }
          const result = await submitVendorRegistration(registration);
          setPendingOtp({
            phone,
            mode: 'register',
            devOtp: result.otp,
            registerOtpRequested: true,
          });
          if (result.shopImageUploadId) {
            useAuthStore.getState().setPendingRegistration({
              ...registration,
              shopImageUploadId: result.shopImageUploadId,
              shopImageUri: undefined,
            });
          }
        }
        if (!cancelled && sendId === otpSendRef.current) {
          setOtpReady(true);
        }
      } catch (err) {
        if (!cancelled && sendId === otpSendRef.current) {
          setError(getApiError(err));
        }
      } finally {
        if (!cancelled && sendId === otpSendRef.current) {
          setSendingOtp(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [phone, pendingOtpMode, registerOtpRequested, setPendingOtp]);

  useEffect(() => {
    if (otp.length !== 6 || submitting || sendingOtp || !otpReady) return;
    if (autoVerifyRef.current === otp) return;
    autoVerifyRef.current = otp;
    void handleVerify(otp);
  }, [otp, submitting, sendingOtp, otpReady, handleVerify]);

  function handleBack() {
    if (isSignIn) {
      clearPendingOtp();
      router.replace('/(onboarding)/login-choice' as Href);
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
        router.replace('/(onboarding)/login-choice' as Href);
      }
    }, [pendingOtpPhone, pendingRegistration]),
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
    otpSendRef.current += 1;
    setOtpReady(false);
    try {
      if (isSignIn) {
        await sendSignInOtp(phone);
        setPendingOtp({
          phone,
          mode: 'sign-in',
          loginIntent: pendingLoginIntent,
        });
        setOtpReady(true);
        return;
      }
      const registration = useAuthStore.getState().pendingRegistration;
      if (!registration) {
        throw new Error('Registration details missing. Go back and try again.');
      }
      const result = await submitVendorRegistration(registration);
      setPendingOtp({
        phone,
        mode: 'register',
        devOtp: result.otp,
        registerOtpRequested: true,
      });
      if (result.shopImageUploadId) {
        useAuthStore.getState().setPendingRegistration({
          ...registration,
          shopImageUploadId: result.shopImageUploadId,
          shopImageUri: undefined,
        });
      }
      setOtpReady(true);
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
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow px-8 pb-8 pt-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="mb-8 gap-3">
            <Text
              className="text-foreground"
              style={{ fontSize: 32, lineHeight: 38, fontWeight: '700' }}>
              We just sent you an SMS
            </Text>
            <Text className="text-muted-foreground text-base leading-6">
              Enter the security code we sent to{'\n'}
              {phoneDisplay}
            </Text>
          </View>

          <View className="gap-6">
            <OtpInput
              value={otp}
              onChange={(value) => {
                autoVerifyRef.current = '';
                setOtp(value);
                setError('');
              }}
            />

            {sendingOtp ? (
              <Text className="text-muted-foreground text-sm">Sending verification code…</Text>
            ) : null}

            {error ? <Text className="text-destructive text-sm">{error}</Text> : null}

            <Pressable
              className="self-start"
              disabled={resending || sendingOtp}
              onPress={() => void handleResend()}>
              <Text className="text-foreground text-sm underline">
                {resending || sendingOtp ? 'Sending code…' : "Didn't receive a code?"}
              </Text>
            </Pressable>

            <View className="gap-4">
              <OnboardingButton
                disabled={otp.length !== 6 || submitting || sendingOtp || !otpReady}
                onPress={() => void handleVerify(otp)}>
                <Text>{submitting ? 'Verifying…' : 'Continue'}</Text>
              </OnboardingButton>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
