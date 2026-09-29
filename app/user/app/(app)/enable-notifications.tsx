import { requestNotificationPermission } from '@/lib/notifications';
import {
  saveNotificationPromptCompleted,
  savePermissionsSetupCompleted,
} from '@/lib/secure-storage';
import { PermissionStepScreen } from '@/module/permissions/components/PermissionStepScreen';
import { Href, router } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { useState } from 'react';

export default function EnableNotificationsScreen() {
  const [loading, setLoading] = useState(false);

  async function finish() {
    await saveNotificationPromptCompleted();
    await savePermissionsSetupCompleted();
    router.replace('/(app)/' as Href);
  }

  async function handleAllow() {
    setLoading(true);
    try {
      await requestNotificationPermission();
    } finally {
      setLoading(false);
    }
    await finish();
  }

  return (
    <PermissionStepScreen
      icon={Bell}
      title="Turn on notifications"
      description="Get order updates, booking reminders, and offers for your area."
      accentClassName="bg-primary/20"
      loading={loading}
      onAllow={() => void handleAllow()}
      onSkip={() => void finish()}
    />
  );
}
