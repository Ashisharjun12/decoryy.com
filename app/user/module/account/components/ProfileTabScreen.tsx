import { Screen, TabScreenTitle } from '@/components/shell';
import { WhatsAppIcon } from '@/components/shell/WhatsAppIcon';
import { requestNotificationPermission } from '@/lib/notifications';
import { openWhatsAppSupport } from '@/lib/support-actions';
import { ProfileHeaderCard } from '@/module/account/components/ProfileHeaderCard';
import { ProfileLogoutButton } from '@/module/account/components/ProfileLogoutButton';
import { ProfileMenuRow } from '@/module/account/components/ProfileMenuRow';
import { ProfileSettingsGroup } from '@/module/account/components/ProfileSettingsGroup';
import { ProfileToggleRow } from '@/module/account/components/ProfileToggleRow';
import {
  PROFILE_MENU_SECTIONS,
  type ProfileMenuItem,
} from '@/module/account/lib/profile-menu';
import { useNotificationPermissionStatus } from '@/module/permissions/hooks/use-notification-permission-status';
import { useAuthStore } from '@/store/auth.store';
import { Href, router } from 'expo-router';
import { useCallback } from 'react';
import { Linking, ScrollView } from 'react-native';

function renderMenuItem(item: ProfileMenuItem, isLast: boolean) {
  if (item.type === 'notification-toggle') {
    return null;
  }
  if (item.type === 'route') {
    return (
      <ProfileMenuRow
        key={item.id}
        label={item.label}
        subtitle={item.subtitle}
        icon={item.icon}
        isLast={isLast}
        onPress={() => router.push(item.href)}
      />
    );
  }
  return (
    <ProfileMenuRow
      key={item.id}
      label={item.label}
      subtitle={item.subtitle}
      isLast={isLast}
      iconSlot={<WhatsAppIcon size={18} color="#25D366" />}
      onPress={() => void openWhatsAppSupport()}
    />
  );
}

export function ProfileTabScreen() {
  const signOut = useAuthStore((s) => s.signOut);
  const { notificationStatus, refresh } = useNotificationPermissionStatus();
  const notificationsOn = notificationStatus === 'granted';

  async function handleSignOut() {
    await signOut();
    router.replace('/(onboarding)/login' as Href);
  }

  const onNotificationToggle = useCallback(
    async (next: boolean) => {
      if (next) {
        await requestNotificationPermission();
        await refresh();
        return;
      }
      if (notificationStatus === 'granted') {
        await Linking.openSettings();
      }
      await refresh();
    },
    [notificationStatus, refresh],
  );

  return (
    <Screen scroll={false} edges={['top', 'left', 'right']} contentClassName="flex-1">
      <TabScreenTitle
        title="Profile"
        showBack
        onBack={() => router.navigate('/(app)/' as Href)}
        backAccessibilityLabel="Back to home"
      />
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-5 pb-28 pt-4"
        showsVerticalScrollIndicator={false}>
        <ProfileSettingsGroup>
          <ProfileHeaderCard />
        </ProfileSettingsGroup>

        {PROFILE_MENU_SECTIONS.map((section) => (
          <ProfileSettingsGroup key={section.id} title={section.title}>
            {section.items.map((item, index) => {
              const isLast = index === section.items.length - 1;
              if (item.type === 'notification-toggle') {
                return (
                  <ProfileToggleRow
                    key={item.id}
                    label={item.label}
                    icon={item.icon}
                    value={notificationsOn}
                    onValueChange={(next) => void onNotificationToggle(next)}
                    isLast={isLast}
                  />
                );
              }
              return renderMenuItem(item, isLast);
            })}
          </ProfileSettingsGroup>
        ))}

        <ProfileLogoutButton onPress={() => void handleSignOut()} />
      </ScrollView>
    </Screen>
  );
}
