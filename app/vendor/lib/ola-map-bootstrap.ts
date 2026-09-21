import { applyOlaMapAuth } from '@/module/geo/lib/ola-map-auth';
import {
  invalidateMapsSdkConfig,
  loadMapsSdkConfig,
} from '@/module/geo/hooks/use-maps-sdk-config';
import { LogManager, NetworkManager } from '@maplibre/maplibre-react-native';
import { AppState, type AppStateStatus } from 'react-native';

let installed = false;

function suppressTransientGlyphDnsLogs() {
  LogManager.onLog((log) => {
    const message = log.message ?? '';
    if (
      message.includes('Failed to load glyph') &&
      (message.includes('Unable to resolve host') ||
        message.includes('No address associated with hostname'))
    ) {
      return true;
    }
    return false;
  });
}

/** Call once at app startup (before any Map mounts). */
export function installOlaMapBootstrap() {
  if (installed) return;
  installed = true;

  try {
    NetworkManager.setConnected(true);
  } catch {
    // iOS: no-op
  }

  suppressTransientGlyphDnsLogs();

  void loadMapsSdkConfig()
    .then((config) => {
      applyOlaMapAuth(config);
    })
    .catch(() => {
      // maps screens will retry via useMapsSdkConfig
    });

  AppState.addEventListener('change', (state: AppStateStatus) => {
    if (state !== 'active') return;
    invalidateMapsSdkConfig();
    void loadMapsSdkConfig()
      .then((config) => {
        applyOlaMapAuth(config);
      })
      .catch(() => undefined);
  });
}
