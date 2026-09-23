import '@/global.css';

import { LoadingPlaceholder } from '@/components/shell';
import { NAV_THEME } from '@/lib/theme';
import { useAuthStore } from '@/store/auth.store';
import { PortalHost } from '@rn-primitives/portal';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export {
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const hydrate = useAuthStore((s) => s.hydrate);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {!hydrated ? (
        <View className="flex-1 items-center justify-center bg-background">
          <LoadingPlaceholder className="py-0" />
        </View>
      ) : (
        <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <Stack screenOptions={{ headerShown: false }} />
          <PortalHost />
        </ThemeProvider>
      )}
    </GestureHandlerRootView>
  );
}
