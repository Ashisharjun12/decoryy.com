import { AppTabBar, LoadingPlaceholder } from '@/components/shell';
import { usePermissionsSetupPrompt } from '@/module/permissions/hooks/use-permissions-setup-prompt';
import { useLocationStore } from '@/store/location.store';
import { Tabs, Redirect, type Href } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

export default function AppLayout() {
  const { pendingRoute, isLoading } = usePermissionsSetupPrompt();
  const bootstrapWithGps = useLocationStore((s) => s.bootstrapWithGps);

  useEffect(() => {
    void bootstrapWithGps();
  }, [bootstrapWithGps]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <LoadingPlaceholder className="py-0" />
      </View>
    );
  }

  if (pendingRoute) {
    return <Redirect href={pendingRoute as Href} />;
  }

  return (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="category" options={{ title: 'Category' }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
      <Tabs.Screen name="instant" options={{ title: 'Instant' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      <Tabs.Screen name="account" options={{ href: null }} />
      <Tabs.Screen name="search" options={{ href: null }} />
      <Tabs.Screen name="product" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="whatsapp" options={{ href: null }} />
      <Tabs.Screen name="enable-location" options={{ href: null }} />
      <Tabs.Screen name="enable-notifications" options={{ href: null }} />
      <Tabs.Screen name="location" options={{ href: null }} />
      <Tabs.Screen name="cart" options={{ href: null }} />
      <Tabs.Screen name="checkout" options={{ href: null }} />
      <Tabs.Screen name="offers" options={{ href: null }} />
    </Tabs>
  );
}
