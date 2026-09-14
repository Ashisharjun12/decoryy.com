import { PermissionStepScreen } from '@/module/permissions/components/PermissionStepScreen';
import { requestForegroundLocationPermission } from '@/lib/location';
import { saveLocationPromptCompleted, savePermissionsSetupCompleted } from '@/lib/secure-storage';
import { Href, router } from 'expo-router';
import { Map } from 'lucide-react-native';
import { useState } from 'react';

export default function EnableLocationScreen() {
  const [loading, setLoading] = useState(false);

  async function finish() {
    await saveLocationPromptCompleted();
    await savePermissionsSetupCompleted();
    router.replace('/(app)' as Href);
  }

  async function handleAllow() {
    setLoading(true);
    try {
      await requestForegroundLocationPermission();
    } finally {
      setLoading(false);
    }
    await finish();
  }

  return (
    <PermissionStepScreen
      icon={Map}
      title="Turn on location"
      description="Share your location when you're en route so customers know you're on the way."
      accentClassName="bg-sky-500/15"
      loading={loading}
      onAllow={() => void handleAllow()}
      onSkip={() => void finish()}
    />
  );
}
