import { api, unwrap } from '@/api/client';
import type { AuthSessionPayload, AuthUser } from '@/lib/auth.types';
import type { PartnerLoginIntent } from '@/lib/login-intent';
import { Platform } from 'react-native';

export type { AuthSessionPayload, AuthUser };

export type OtpRequestResult = {
  phone: string;
  otp?: string;
};

export function requestOtp(phone: string, androidAppHash?: string) {
  return api
    .post('/auth/otp/request', {
      phone,
      ...(androidAppHash ? { androidAppHash } : {}),
    })
    .then(unwrap<OtpRequestResult>);
}

export function verifyOtp(phone: string, otp: string, loginIntent?: PartnerLoginIntent) {
  return api
    .post('/auth/otp/verify', {
      phone,
      otp,
      clientType: 'mobile',
      device: Platform.OS === 'ios' ? 'ios' : 'android',
      ...(loginIntent ? { loginIntent } : {}),
    })
    .then(unwrap<AuthSessionPayload>);
}

export function me() {
  return api.get('/auth/me').then(unwrap<AuthUser>);
}

export function refresh(refreshToken: string) {
  return api
    .post('/auth/refresh', {
      refreshToken,
      clientType: 'mobile',
      device: Platform.OS === 'ios' ? 'ios' : 'android',
    })
    .then(unwrap<AuthSessionPayload>);
}

export function logout(refreshToken: string) {
  return api.post('/auth/logout', { refreshToken }).then(unwrap<null>);
}
