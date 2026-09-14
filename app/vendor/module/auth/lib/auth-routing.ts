import type { AuthUser } from '@/lib/auth.types';
import type { Href } from 'expo-router';

export type AuthRedirectInput = {
  hydrated: boolean;
  hasSeenWelcome: boolean;
  accessToken: string | null;
  user: AuthUser | null;
};

export function isAuthenticated(accessToken: string | null, user: AuthUser | null) {
  return Boolean(accessToken && user);
}

export function getUnauthenticatedRedirect(hasSeenWelcome: boolean): Href {
  if (!hasSeenWelcome) {
    return '/(onboarding)/welcome' as Href;
  }
  return '/(onboarding)/sign-in' as Href;
}

export function getAuthRedirectPath(state: AuthRedirectInput): Href | null {
  if (!state.hydrated) return null;

  if (!isAuthenticated(state.accessToken, state.user)) {
    return getUnauthenticatedRedirect(state.hasSeenWelcome);
  }

  const vendor = state.user!.vendor;
  if (!vendor) return '/(onboarding)/register' as Href;
  if (vendor.onboardingStatus === 'PENDING') return '/(gate)/pending' as Href;
  if (vendor.onboardingStatus === 'REJECTED') return '/(gate)/rejected' as Href;
  if (vendor.onboardingStatus === 'ACTIVE') return '/(app)' as Href;

  return '/(onboarding)/sign-in' as Href;
}

export function getPostOtpRedirectPath(user: AuthUser): Href {
  if (user.vendor?.onboardingStatus === 'ACTIVE') return '/(app)' as Href;
  if (user.vendor?.onboardingStatus === 'PENDING') return '/(gate)/pending' as Href;
  if (user.vendor?.onboardingStatus === 'REJECTED') return '/(gate)/rejected' as Href;
  return '/(onboarding)/sign-in' as Href;
}

export function getAppAccessRedirect(
  accessToken: string | null,
  user: AuthUser | null,
  hasSeenWelcome: boolean,
): Href | null {
  if (!isAuthenticated(accessToken, user)) {
    return getUnauthenticatedRedirect(hasSeenWelcome);
  }

  const status = user!.vendor?.onboardingStatus;
  if (status === 'PENDING') return '/(gate)/pending' as Href;
  if (status === 'REJECTED') return '/(gate)/rejected' as Href;
  if (status !== 'ACTIVE') return '/(onboarding)/sign-in' as Href;

  return null;
}

export function getGateAccessRedirect(
  accessToken: string | null,
  user: AuthUser | null,
  hasSeenWelcome: boolean,
): Href | null {
  if (!isAuthenticated(accessToken, user)) {
    return getUnauthenticatedRedirect(hasSeenWelcome);
  }

  const status = user!.vendor?.onboardingStatus;
  if (status === 'ACTIVE') return '/(app)' as Href;
  if (status === 'PENDING' || status === 'REJECTED') return null;

  return '/(onboarding)/sign-in' as Href;
}

export function getOnboardingAccessRedirect(
  accessToken: string | null,
  user: AuthUser | null,
): Href | null {
  if (!isAuthenticated(accessToken, user)) {
    return null;
  }

  const status = user!.vendor?.onboardingStatus;
  if (status === 'ACTIVE') return '/(app)' as Href;
  if (status === 'PENDING') return '/(gate)/pending' as Href;
  if (status === 'REJECTED') return '/(gate)/rejected' as Href;

  return null;
}
