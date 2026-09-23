import type { CustomerUser, MockSessionPayload } from '@/lib/auth.types';
import {
  clearAccessToken,
  clearHasSeenWelcome,
  loadAccessToken,
  loadHasSeenWelcome,
  loadUserPhone,
  saveAccessToken,
  saveHasSeenWelcome,
  saveUserPhone,
} from '@/lib/secure-storage';
import { create } from 'zustand';

export { getAuthRedirectPath } from '@/module/auth/lib/auth-routing';

type AuthState = {
  hydrated: boolean;
  hasSeenWelcome: boolean;
  accessToken: string | null;
  user: CustomerUser | null;
  pendingOtpPhone: string | null;
  lastDevOtp: string | null;
  hydrate: () => Promise<void>;
  completeWelcome: () => Promise<void>;
  setPendingOtp: (phone: string) => void;
  clearPendingOtp: () => void;
  setSession: (payload: MockSessionPayload) => Promise<void>;
  signOut: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  hydrated: false,
  hasSeenWelcome: false,
  accessToken: null,
  user: null,
  pendingOtpPhone: null,
  lastDevOtp: null,

  hydrate: async () => {
    const [hasSeenWelcome, accessToken, phone] = await Promise.all([
      loadHasSeenWelcome(),
      loadAccessToken(),
      loadUserPhone(),
    ]);

    if (!accessToken) {
      set({ hydrated: true, hasSeenWelcome, accessToken: null, user: null });
      return;
    }

    set({
      hydrated: true,
      hasSeenWelcome,
      accessToken,
      user: {
        id: 'mock-customer',
        name: 'Guest',
        phone: phone ?? '',
      },
    });
  },

  completeWelcome: async () => {
    await saveHasSeenWelcome();
    set({ hasSeenWelcome: true });
  },

  setPendingOtp: (phone) => set({ pendingOtpPhone: phone }),

  clearPendingOtp: () => set({ pendingOtpPhone: null }),

  setSession: async (payload) => {
    await Promise.all([
      saveAccessToken(payload.accessToken),
      saveUserPhone(payload.user.phone),
    ]);
    set({
      accessToken: payload.accessToken,
      user: payload.user,
      pendingOtpPhone: null,
    });
  },

  signOut: async () => {
    await clearAccessToken();
    set({ accessToken: null, user: null, pendingOtpPhone: null });
  },

  resetOnboarding: async () => {
    await Promise.all([clearAccessToken(), clearHasSeenWelcome()]);
    set({
      hasSeenWelcome: false,
      accessToken: null,
      user: null,
      pendingOtpPhone: null,
      lastDevOtp: null,
    });
  },
}));
