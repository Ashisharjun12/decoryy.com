import { PermissionStepScreen } from '@/module/permissions/components/PermissionStepScreen';
import { syncPushRegistration } from '@/lib/push-registration';
import { requestNotificationPermission } from '@/lib/notifications';
import { saveNotificationPromptCompleted } from '@/lib/secure-storage';
import { useAuthStore } from '@/store/auth.store';
import { Href, router } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { useState } from 'react';

export default function EnableNotificationsScreen() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const [loading, setLoading] = useState(false);

  async function goToNextStep() {
    await saveNotificationPromptCompleted();
    router.replace('/(app)/enable-location' as Href);
  }

  async function handleAllow() {
    setLoading(true);
    try {
      const granted = await requestNotificationPermission();
      if (granted && accessToken && userId) {
        await syncPushRegistration(accessToken, userId);
      }
      await goToNextStep();
    } finally {
      setLoading(false);
    }
  }

  return (
    <PermissionStepScreen
      icon={Bell}
      title="Turn on notifications"
      description="Get instant alerts when Decoryy assigns you a new booking. You won't miss time-sensitive jobs."
      accentClassName="bg-primary/20"
      loading={loading}
      onAllow={() => void handleAllow()}
      onSkip={() => void goToNextStep()}
    />
  );
}
