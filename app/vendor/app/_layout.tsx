import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { useNotificationListeners } from '@/hooks/use-notification-listeners';
import { ThemeBootstrap } from '@/module/settings/components/ThemeBootstrap';
import { QueryProvider } from '@/providers/query-provider';
import { SocketProvider } from '@/providers/socket-provider';
import { useAuthStore } from '@/store/auth.store';
import { PortalHost } from '@rn-primitives/portal';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

function NotificationListenersHost() {
  useNotificationListeners();
  return null;
}

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const hydrate = useAuthStore((s) => s.hydrate);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <SocketProvider>
          {!hydrated ? (
            <View className="flex-1 items-center justify-center bg-background">
              <ActivityIndicator />
            </View>
          ) : (
            <>
              <ThemeBootstrap />
              <NotificationListenersHost />
              <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
                <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
                <Stack screenOptions={{ headerShown: false }} />
                <PortalHost />
              </ThemeProvider>
            </>
          )}
        </SocketProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
