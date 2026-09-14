import { NAV_THEME } from '@/lib/theme';
import { AuthGate } from '@/module/auth/components/AuthGate';
import { getAppAccessRedirect } from '@/module/auth/lib/auth-routing';
import { useAppSessionState } from '@/module/chat/hooks/use-app-session-state';
import { usePermissionsSetupPrompt } from '@/module/permissions/hooks/use-permissions-setup-prompt';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs, usePathname } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

type TabIconName = keyof typeof Ionicons.glyphMap;

function TabBarIcon({
  focused,
  color,
  size,
  activeIcon,
  inactiveIcon,
}: {
  focused: boolean;
  color: string;
  size: number;
  activeIcon: TabIconName;
  inactiveIcon: TabIconName;
}) {
  const scale = useSharedValue(focused ? 1.06 : 1);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.06 : 1, { damping: 14, stiffness: 300 });
  }, [focused, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons name={focused ? activeIcon : inactiveIcon} size={size} color={color} />
    </Animated.View>
  );
}

function AppTabs() {
  const { colorScheme } = useColorScheme();
  const theme = NAV_THEME[colorScheme ?? 'light'];
  const { pendingRoute, isLoading } = usePermissionsSetupPrompt();
  const pathname = usePathname();
  const onSetupScreen =
    pathname.includes('enable-notifications') || pathname.includes('enable-location');
  const hideTabBar = /bookings\/[^/]+/.test(pathname);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  if (pendingRoute && !onSetupScreen) {
    return <Redirect href={pendingRoute} />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text + '80',
        tabBarStyle: hideTabBar
          ? { display: 'none' }
          : {
              backgroundColor: theme.colors.card,
              borderTopWidth: 0,
              elevation: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              height: Platform.OS === 'ios' ? 88 : 64,
              paddingTop: 8,
            },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '400',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused, size }) => (
            <TabBarIcon
              focused={focused}
              color={color}
              size={size}
              activeIcon="home"
              inactiveIcon="home-outline"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color, focused, size }) => (
            <TabBarIcon
              focused={focused}
              color={color}
              size={size}
              activeIcon="calendar"
              inactiveIcon="calendar-outline"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="payouts"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, focused, size }) => (
            <TabBarIcon
              focused={focused}
              color={color}
              size={size}
              activeIcon="wallet"
              inactiveIcon="wallet-outline"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused, size }) => (
            <TabBarIcon
              focused={focused}
              color={color}
              size={size}
              activeIcon="person"
              inactiveIcon="person-outline"
            />
          ),
        }}
      />
      <Tabs.Screen name="support" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="enable-notifications" options={{ href: null }} />
      <Tabs.Screen name="enable-location" options={{ href: null }} />
      <Tabs.Screen name="app-permissions" options={{ href: null }} />
      <Tabs.Screen name="edit-profile" options={{ href: null }} />
      <Tabs.Screen name="app-theme" options={{ href: null }} />
      <Tabs.Screen name="bank-accounts" options={{ href: null }} />
      <Tabs.Screen name="add-bank-account" options={{ href: null }} />
      <Tabs.Screen name="upi-ids" options={{ href: null }} />
      <Tabs.Screen name="add-upi-id" options={{ href: null }} />
    </Tabs>
  );
}

function AppSessionStateHost() {
  useAppSessionState();
  return null;
}

export default function AppLayout() {
  return (
    <AuthGate
      resolveRedirect={({ accessToken, user, hasSeenWelcome }) =>
        getAppAccessRedirect(accessToken, user, hasSeenWelcome)
      }>
      <AppSessionStateHost />
      <AppTabs />
    </AuthGate>
  );
}
