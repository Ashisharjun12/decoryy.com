import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useChatStore } from '@/store/chat.store';

const ANDROID_CHANNEL_ID = 'vendor-default';

export type NotificationPermissionStatus = 'granted' | 'denied' | 'undetermined';

export function getEasProjectId(): string | null {
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId ??
    null;

  if (!projectId || projectId === 'REPLACE_AFTER_EAS_INIT') {
    return null;
  }

  return projectId;
}

export async function ensureAndroidNotificationChannel() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Decoryy vendor',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
  });
}

export async function getNotificationPermissionStatus(): Promise<NotificationPermissionStatus> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return 'granted';
  if (current.status === 'denied') return 'denied';
  return 'undetermined';
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice) {
    return false;
  }

  const current = await getNotificationPermissionStatus();
  if (current === 'granted') {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return (
    requested.granted ||
    requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

/** @deprecated Use requestNotificationPermission */
export async function requestPushPermissions(): Promise<boolean> {
  return requestNotificationPermission();
}

export async function getExpoPushToken(): Promise<string | null> {
  const projectId = getEasProjectId();
  if (!projectId) {
    console.warn('[push] Missing EAS projectId. Run `npx eas init` and update app.json.');
    return null;
  }

  await ensureAndroidNotificationChannel();

  const granted = await getNotificationPermissionStatus();
  if (granted !== 'granted') {
    return null;
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return token.data;
  } catch (error) {
    console.warn(
      '[push] Could not get Expo push token. On Android, configure FCM credentials and rebuild the native app.',
      error,
    );
    return null;
  }
}

export function getPushPlatform(): 'android' | 'ios' {
  return Platform.OS === 'ios' ? 'ios' : 'android';
}

function shouldSuppressChatNotification(data: Record<string, unknown> | undefined) {
  if (data?.event !== 'CHAT_MESSAGE') return false;
  const conversationId =
    typeof data.conversationId === 'string' ? data.conversationId : null;
  if (!conversationId) return false;
  return useChatStore.getState().activeConversationId === conversationId;
}

export function configureForegroundNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      const data = notification.request.content.data as Record<string, unknown>;
      if (shouldSuppressChatNotification(data)) {
        return {
          shouldShowAlert: false,
          shouldPlaySound: false,
          shouldSetBadge: false,
          shouldShowBanner: false,
          shouldShowList: false,
        };
      }

      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      };
    },
  });
}
