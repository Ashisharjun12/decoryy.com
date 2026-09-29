import {
  loadLocationPromptCompleted,
  loadNotificationPromptCompleted,
  loadPermissionsSetupCompleted,
  savePermissionsSetupCompleted,
} from '@/lib/secure-storage';
import { isNativePlatform } from '@/module/permissions/lib/platform-permissions';
import { useAuthStore } from '@/store/auth.store';
import { usePathname } from 'expo-router';
import type { Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

/** After login: full-screen location step, then notifications (vendor-style). */
export function usePermissionsSetupPrompt() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();
  const isLoggedIn = Boolean(accessToken && user);

  const [setupCompleted, setSetupCompleted] = useState<boolean | null>(null);
  const [locationStepDone, setLocationStepDone] = useState<boolean | null>(null);
  const [notificationStepDone, setNotificationStepDone] = useState<boolean | null>(null);

  const reload = useCallback(async () => {
    const [completed, locationDone, notificationDone] = await Promise.all([
      loadPermissionsSetupCompleted(),
      loadLocationPromptCompleted(),
      loadNotificationPromptCompleted(),
    ]);
    if (!completed && locationDone && notificationDone) {
      await savePermissionsSetupCompleted();
      setSetupCompleted(true);
    } else {
      setSetupCompleted(completed);
    }
    setLocationStepDone(locationDone);
    setNotificationStepDone(notificationDone);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload, pathname]);

  const isLoading =
    setupCompleted === null || locationStepDone === null || notificationStepDone === null;

  let pendingRoute: Href | null = null;

  const onSetupScreen =
    pathname.includes('enable-location') || pathname.includes('enable-notifications');

  if (
    isLoggedIn &&
    isNativePlatform() &&
    setupCompleted === false &&
    !onSetupScreen
  ) {
    if (locationStepDone === false) {
      pendingRoute = '/(app)/enable-location' as Href;
    } else if (notificationStepDone === false) {
      pendingRoute = '/(app)/enable-notifications' as Href;
    }
  }

  return {
    pendingRoute,
    isLoading,
    reload,
  };
}
