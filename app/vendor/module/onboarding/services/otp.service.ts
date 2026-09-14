import { requestOtp, verifyOtp } from '@/api/auth.api';
import { getAndroidOtpAppHash } from '@/lib/android-app-hash';
import { useAuthStore } from '@/store/auth.store';

export async function sendSignInOtp(phone: string) {
  const androidAppHash = await getAndroidOtpAppHash();
  return requestOtp(phone, androidAppHash);
}

export async function verifySignInOtp(phone: string, otp: string) {
  const result = await verifyOtp(phone, otp);
  await useAuthStore.getState().setSession(result);
  return result;
}

export async function verifyRegisterOtp(phone: string, otp: string) {
  return verifySignInOtp(phone, otp);
}
