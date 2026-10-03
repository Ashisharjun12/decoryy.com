import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatIndiaPhoneDisplay } from '@/lib/phone';
import { AccountInfoRow } from '@/module/account/components/AccountInfoRow';
import { AccountSubScreen } from '@/module/account/components/AccountSubScreen';
import { LinkGoogleSheet } from '@/module/account/components/LinkGoogleSheet';
import { LinkPhoneSheet } from '@/module/account/components/LinkPhoneSheet';
import { profileInitials } from '@/module/account/lib/profile-initials';
import { useCurrentUserQuery } from '@/module/account/hooks/use-current-user-query';
import { useAuthStore } from '@/store/auth.store';
import { Upload } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { useState } from 'react';
import { View } from 'react-native';

export function AccountScreen() {
  const user = useAuthStore((s) => s.user);
  const { isPending } = useCurrentUserQuery();
  const loading = isPending && !user;
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [googleOpen, setGoogleOpen] = useState(false);

  const hasPhone = Boolean(user?.phone?.trim());
  const hasGoogle = Boolean(user?.linkedGoogle);
  const name = user?.name?.trim() || '—';
  const email = user?.email?.trim() || 'Not linked';
  const phoneDisplay = hasPhone
    ? formatIndiaPhoneDisplay(user!.phone!)
    : 'Not linked';

  const signInValue = hasGoogle
    ? 'Google linked'
    : hasPhone
      ? 'Phone OTP'
      : 'Link Google or phone to sign in';

  return (
    <AccountSubScreen title="Personal info">
      <Text className="text-muted-foreground -mt-2 text-sm">
        Name, contact details, and how you sign in.
      </Text>

      <View className="mt-4 flex-row flex-wrap items-center gap-4">
        <Avatar alt={name} className="size-20 border-2 border-border">
          {user?.avatar ? <AvatarImage source={{ uri: user.avatar }} alt="" /> : null}
          <AvatarFallback className="bg-muted">
            <Text className="text-foreground text-lg font-semibold">
              {profileInitials(user?.name ?? '')}
            </Text>
          </AvatarFallback>
        </Avatar>
        <Button variant="outline" size="sm" disabled className="rounded-full opacity-60">
          <Icon as={Upload} className="size-4" />
          <Text>Upload photo</Text>
        </Button>
      </View>

      <View className="mt-2">
        {loading ? (
          <View className="gap-4 py-4">
            <Skeleton className="h-14 w-full rounded-md" />
            <Skeleton className="h-14 w-full rounded-md" />
          </View>
        ) : (
          <>
            <AccountInfoRow label="Name" value={name} />
            <AccountInfoRow label="Email" value={email} />
            <AccountInfoRow
              label="Phone number"
              value={phoneDisplay}
              onActionPress={() => setPhoneOpen(true)}
              actionLabel={hasPhone ? 'Edit' : 'Add'}
            />
            <AccountInfoRow
              label="Sign-in"
              value={signInValue}
              onActionPress={!hasGoogle ? () => setGoogleOpen(true) : undefined}
              actionLabel={!hasGoogle ? 'Link' : undefined}
            />
          </>
        )}
      </View>

      <LinkPhoneSheet open={phoneOpen} onOpenChange={setPhoneOpen} hasPhone={hasPhone} />
      <LinkGoogleSheet open={googleOpen} onOpenChange={setGoogleOpen} />
    </AccountSubScreen>
  );
}
