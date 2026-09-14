import { FadeInView } from '@/components/motion';
import { PillFilter, Screen, ScreenHeader, type PillOption } from '@/components/shell';
import { BookingsEmptyState } from '@/module/bookings/components/BookingsEmptyState';
import { JobCard } from '@/module/bookings/components/JobCard';
import { BookingsScreenSkeleton } from '@/module/bookings/components/skeletons/BookingsScreenSkeleton';
import { useVendorJobsScreen } from '@/module/bookings/hooks/use-vendor-jobs-screen';
import { getBookingsEmptyMessage } from '@/module/bookings/lib/get-bookings-empty-message';
import type { JobFilter } from '@/module/bookings/lib/booking.types';
import { OfflineDutyBanner } from '@/module/duty/components/OfflineDutyBanner';
import { useVendorDuty } from '@/module/duty/hooks/use-vendor-duty';
import { useUnreadNotificationCount } from '@/module/notifications/hooks/use-unread-count';
import { Href, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

function useFilterOptions(actionCount: number): PillOption<JobFilter>[] {
  return useMemo(() => {
    const base: PillOption<JobFilter>[] = [
      { value: 'today', label: 'Today' },
      { value: 'upcoming', label: 'Upcoming' },
      { value: 'completed', label: 'Completed' },
    ];
    if (actionCount > 0) {
      return [{ value: 'action', label: 'Action', badgeCount: actionCount }, ...base];
    }
    return base;
  }, [actionCount]);
}

export default function BookingsScreen() {
  const [filter, setFilter] = useState<JobFilter>('today');
  const unreadCount = useUnreadNotificationCount();
  const { isOnDuty, canToggle } = useVendorDuty();
  const { bookings, actionCount, isLoading, refreshControl } = useVendorJobsScreen(filter);
  const options = useFilterOptions(actionCount);
  const emptyMessage = getBookingsEmptyMessage(filter, { isOnDuty, canToggle });

  return (
    <Screen scrollProps={{ refreshControl }}>
      <ScreenHeader
        title="Bookings"
        subtitle="Your assigned jobs"
        unreadCount={unreadCount}
      />

      <PillFilter value={filter} options={options} onChange={setFilter} />

      <OfflineDutyBanner />

      {isLoading ? (
        <BookingsScreenSkeleton />
      ) : bookings.length === 0 ? (
        <BookingsEmptyState message={emptyMessage} />
      ) : (
        <View className="gap-3">
          {bookings.map((booking, index) => (
            <FadeInView key={booking.id} delay={index * 60}>
              <JobCard
                booking={booking}
                onPress={() => router.push(`/(app)/bookings/${booking.id}` as Href)}
              />
            </FadeInView>
          ))}
        </View>
      )}
    </Screen>
  );
}
