import {
  loadLocationPromptCompleted,
  loadNotificationPromptCompleted,
  loadPermissionsSetupCompleted,
} from '@/lib/secure-storage';
import { useAuthStore } from '@/store/auth.store';
import { usePathname } from 'expo-router';
import type { Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

export function usePermissionsSetupPrompt() {
  const vendorStatus = useAuthStore((s) => s.user?.vendor?.onboardingStatus ?? null);
  const pathname = usePathname();
  const [setupCompleted, setSetupCompleted] = useState<boolean | null>(null);
  const [notificationStepDone, setNotificationStepDone] = useState<boolean | null>(null);
  const [locationStepDone, setLocationStepDone] = useState<boolean | null>(null);

  const reload = useCallback(async () => {
    const [completed, notificationDone, locationDone] = await Promise.all([
      loadPermissionsSetupCompleted(),
      loadNotificationPromptCompleted(),
      loadLocationPromptCompleted(),
    ]);

    setSetupCompleted(completed);
    setNotificationStepDone(notificationDone);
    setLocationStepDone(locationDone);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload, pathname]);

  const isLoading =
    setupCompleted === null || notificationStepDone === null || locationStepDone === null;

  let pendingRoute: Href | null = null;

  if (vendorStatus === 'ACTIVE' && setupCompleted === false) {
    if (notificationStepDone === false) {
      pendingRoute = '/(app)/enable-notifications' as Href;
    } else if (locationStepDone === false) {
      pendingRoute = '/(app)/enable-location' as Href;
    }
  }

  return {
    pendingRoute,
    isLoading,
    reload,
  };
}
