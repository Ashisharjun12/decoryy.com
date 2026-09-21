import {
  clearActiveEnRouteOrderId,
  loadActiveEnRouteOrderId,
  saveActiveEnRouteOrderId,
} from '@/lib/secure-storage';
import {
  startEnRouteBackgroundLocation,
  stopEnRouteBackgroundLocation,
} from '@/lib/job-en-route-background-location';
import { create } from 'zustand';

type EnRouteTripState = {
  hydrated: boolean;
  activeOrderId: string | null;
  backgroundSharing: boolean;
  permissionDeniedAt: number | null;
  hydrate: () => Promise<void>;
  beginTrip: (orderId: string) => Promise<boolean>;
  endTrip: () => Promise<void>;
  ensureBackgroundSharing: () => Promise<boolean>;
  clearPermissionDenied: () => void;
};

export const useEnRouteTripStore = create<EnRouteTripState>((set, get) => ({
  hydrated: false,
  activeOrderId: null,
  backgroundSharing: false,
  permissionDeniedAt: null,

  hydrate: async () => {
    const persisted = await loadActiveEnRouteOrderId();
    set({ hydrated: true, activeOrderId: persisted });
  },

  beginTrip: async (orderId) => {
    const trimmed = orderId.trim();
    if (!trimmed) return false;

    await saveActiveEnRouteOrderId(trimmed);
    set({ activeOrderId: trimmed });

    const started = await startEnRouteBackgroundLocation(trimmed);
    if (!started) {
      set({
        backgroundSharing: false,
        permissionDeniedAt: Date.now(),
      });
      return false;
    }

    set({ backgroundSharing: true, permissionDeniedAt: null });
    return true;
  },

  endTrip: async () => {
    await stopEnRouteBackgroundLocation();
    await clearActiveEnRouteOrderId();
    set({
      activeOrderId: null,
      backgroundSharing: false,
      permissionDeniedAt: null,
    });
  },

  ensureBackgroundSharing: async () => {
    const orderId = get().activeOrderId;
    if (!orderId) {
      set({ backgroundSharing: false });
      return false;
    }

    const started = await startEnRouteBackgroundLocation(orderId);
    set({
      backgroundSharing: started,
      permissionDeniedAt: started ? null : get().permissionDeniedAt ?? Date.now(),
    });
    return started;
  },

  clearPermissionDenied: () => set({ permissionDeniedAt: null }),
}));
