import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { formatIndiaPhoneDisplay } from '@/lib/phone';
import { AccountSubScreen } from '@/module/account/components/AccountSubScreen';
import { useCurrentUserQuery } from '@/module/account/hooks/use-current-user-query';
import { useAuthStore } from '@/store/auth.store';
import { View } from 'react-native';

function displayValue(value: string | null | undefined, empty = 'Not set') {
  const trimmed = value?.trim();
  return trimmed ? trimmed : empty;
}

function AccountField({
  label,
  value,
  loading,
}: {
  label: string;
  value: string;
  loading?: boolean;
}) {
  return (
    <View className="gap-1.5 py-3.5">
      <Text className="text-muted-foreground text-[13px] font-medium">{label}</Text>
      {loading ? (
        <Skeleton className="h-5 w-40 rounded-md" />
      ) : (
        <Text className="text-foreground text-[17px] font-medium leading-snug">{value}</Text>
      )}
    </View>
  );
}

export function AccountScreen() {
  const user = useAuthStore((s) => s.user);
  const { isPending } = useCurrentUserQuery();
  const loading = isPending && !user;

  const name = displayValue(user?.name, '—');
  const phone = user?.phone?.trim()
    ? formatIndiaPhoneDisplay(user.phone)
    : displayValue(null);
  const email = displayValue(user?.email, '—');

  return (
    <AccountSubScreen title="Account">
      <View className="overflow-hidden rounded-2xl bg-muted/30">
        <View className="px-4">
          <AccountField label="Full name" value={name} loading={loading} />
          <View className="h-px bg-border/60" />
          <AccountField label="Mobile number" value={phone} loading={loading && !user?.phone} />
          <View className="h-px bg-border/60" />
          <AccountField label="Email" value={email} loading={loading && !user?.email} />
        </View>
      </View>

    </AccountSubScreen>
  );
}
