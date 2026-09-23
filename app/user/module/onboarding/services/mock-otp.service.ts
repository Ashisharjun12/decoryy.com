import { MOCK_OTP } from '@/module/onboarding/lib/onboarding-copy';
import { useAuthStore } from '@/store/auth.store';

const MOCK_DELAY_MS = 400;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendSignInOtp(phone: string) {
  await delay(MOCK_DELAY_MS);
  useAuthStore.setState({ lastDevOtp: MOCK_OTP });
  return { phone, mock: true as const };
}

export async function verifySignInOtp(phone: string, otp: string) {
  await delay(MOCK_DELAY_MS);
  if (otp !== MOCK_OTP) {
    throw new Error('Invalid OTP. Try again.');
  }

  const payload = {
    accessToken: `mock_${phone}_${Date.now()}`,
    user: {
      id: 'mock-customer',
      name: 'Guest',
      phone,
    },
  };

  await useAuthStore.getState().setSession(payload);
  return payload;
}
