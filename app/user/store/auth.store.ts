import type { AuthSessionPayload, CustomerUser } from '@/lib/auth.types';
import {
  clearAccessToken,
  clearHasSeenWelcome,
  loadAccessToken,
  loadHasSeenWelcome,
  loadUserProfile,
  saveAccessToken,
  saveHasSeenWelcome,
  saveRefreshToken,
  saveUserPhone,
  saveUserProfile,
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
  setSession: (payload: AuthSessionPayload) => Promise<void>;
  updateUser: (user: CustomerUser) => Promise<void>;
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
    const [hasSeenWelcome, accessToken, profile] = await Promise.all([
      loadHasSeenWelcome(),
      loadAccessToken(),
      loadUserProfile(),
    ]);

    if (!accessToken) {
      set({ hydrated: true, hasSeenWelcome, accessToken: null, user: null });
      return;
    }

    set({
      hydrated: true,
      hasSeenWelcome,
      accessToken,
      user: profile,
    });
  },

  completeWelcome: async () => {
    await saveHasSeenWelcome();
    set({ hasSeenWelcome: true });
  },

  setPendingOtp: (phone) => set({ pendingOtpPhone: phone }),

  clearPendingOtp: () => set({ pendingOtpPhone: null }),

  setSession: async (payload) => {
    const saves: Promise<void>[] = [
      saveAccessToken(payload.accessToken),
      saveUserProfile(payload.user),
      saveUserPhone(payload.user.phone),
    ];
    if (payload.refreshToken) {
      saves.push(saveRefreshToken(payload.refreshToken));
    }
    await Promise.all(saves);
    set({
      accessToken: payload.accessToken,
      user: payload.user,
      pendingOtpPhone: null,
    });
  },

  updateUser: async (user) => {
    await Promise.all([saveUserProfile(user), saveUserPhone(user.phone)]);
    set({ user });
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
