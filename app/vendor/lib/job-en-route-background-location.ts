import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { EN_ROUTE_FGS_NOTIFICATION } from '@/lib/en-route-notification-copy';
import {
  logBackgroundLocationPostError,
  postJobLocationBackground,
} from '@/lib/post-job-location-background';
import { loadActiveEnRouteOrderId } from '@/lib/secure-storage';

export const EN_ROUTE_LOCATION_TASK = 'decory-en-route-location';

let activeOrderId: string | null = null;

type LocationTaskData = {
  locations?: Location.LocationObject[];
};

async function resolveActiveOrderId(): Promise<string | null> {
  if (activeOrderId) return activeOrderId;
  return loadActiveEnRouteOrderId();
}

if (!TaskManager.isTaskDefined(EN_ROUTE_LOCATION_TASK)) {
  TaskManager.defineTask(EN_ROUTE_LOCATION_TASK, async ({ data, error }) => {
    if (error) return;
    const orderId = await resolveActiveOrderId();
    if (!orderId) return;

    const locations = (data as LocationTaskData | undefined)?.locations;
    const fix = locations?.[locations.length - 1];
    if (!fix) return;
    try {
      const heading = fix.coords.heading;
      const speed = fix.coords.speed;
      await postJobLocationBackground(orderId, {
        latitude: fix.coords.latitude,
        longitude: fix.coords.longitude,
        heading: heading != null && heading >= 0 ? heading : undefined,
        speed: speed != null && speed >= 0 ? speed : undefined,
      });
    } catch (err) {
      logBackgroundLocationPostError(err);
    }
  });
}

export async function isEnRouteBackgroundLocationActive(): Promise<boolean> {
  return Location.hasStartedLocationUpdatesAsync(EN_ROUTE_LOCATION_TASK);
}

export async function startEnRouteBackgroundLocation(orderId: string): Promise<boolean> {
  const trimmed = orderId.trim();
  if (!trimmed) return false;

  const alreadyActive = await isEnRouteBackgroundLocationActive();
  if (alreadyActive && activeOrderId === trimmed) {
    return true;
  }

  activeOrderId = trimmed;

  const fg = await Location.requestForegroundPermissionsAsync();
  if (fg.status !== Location.PermissionStatus.GRANTED) return false;

  const bg = await Location.requestBackgroundPermissionsAsync();
  if (bg.status !== Location.PermissionStatus.GRANTED) {
    return false;
  }

  if (alreadyActive) {
    await Location.stopLocationUpdatesAsync(EN_ROUTE_LOCATION_TASK);
  }

  await Location.startLocationUpdatesAsync(EN_ROUTE_LOCATION_TASK, {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: 8000,
    distanceInterval: 20,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: EN_ROUTE_FGS_NOTIFICATION.title,
      notificationBody: EN_ROUTE_FGS_NOTIFICATION.body,
    },
  });
  return true;
}

export async function stopEnRouteBackgroundLocation(): Promise<void> {
  activeOrderId = null;
  const started = await Location.hasStartedLocationUpdatesAsync(EN_ROUTE_LOCATION_TASK);
  if (started) {
    await Location.stopLocationUpdatesAsync(EN_ROUTE_LOCATION_TASK);
  }
}
