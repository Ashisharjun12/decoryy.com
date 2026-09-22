import { NAV_THEME } from '@/lib/theme';
import { AuthGate } from '@/module/auth/components/AuthGate';
import { EnRouteLocationController } from '@/module/bookings/components/EnRouteLocationController';
import { VendorDispatchPresenceController } from '@/module/duty/components/VendorDispatchPresenceController';
import { getAppAccessRedirect } from '@/module/auth/lib/auth-routing';
import { useAppSessionState } from '@/module/chat/hooks/use-app-session-state';
import { usePermissionsSetupPrompt } from '@/module/permissions/hooks/use-permissions-setup-prompt';
import { useAuthStore } from '@/store/auth.store';
import { selectIsFieldShell, usePartnerModeStore } from '@/store/partner-mode.store';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs, usePathname } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { LoadingPlaceholder } from '@/components/shell';
import { Platform, View } from 'react-native';
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
  const user = useAuthStore((s) => s.user);
  const partnerMode = usePartnerModeStore((s) => s.mode);
  const isFieldShell = selectIsFieldShell(partnerMode, user);
  const { pendingRoute, isLoading } = usePermissionsSetupPrompt();
  const pathname = usePathname();
  const onSetupScreen =
    pathname.includes('enable-notifications') || pathname.includes('enable-location');
  const hideTabBar =
    /bookings\/[^/]+/.test(pathname) ||
    pathname.includes('support') ||
    pathname.includes('help-support');

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <LoadingPlaceholder className="py-0" />
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
          title: isFieldShell ? 'Today' : 'Home',
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
          title: isFieldShell ? 'My jobs' : 'Bookings',
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
        name="messages"
        options={{
          title: 'Messages',
          href: isFieldShell ? undefined : null,
          tabBarIcon: ({ color, focused, size }) => (
            <TabBarIcon
              focused={focused}
              color={color}
              size={size}
              activeIcon="chatbubbles"
              inactiveIcon="chatbubbles-outline"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="payouts"
        options={{
          title: 'Wallet',
          href: isFieldShell ? null : undefined,
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
      <Tabs.Screen name="help-support" options={{ href: null }} />
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
      <Tabs.Screen name="team" options={{ href: null }} />
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
      <EnRouteLocationController />
      <VendorDispatchPresenceController />
      <AppTabs />
    </AuthGate>
  );
}
