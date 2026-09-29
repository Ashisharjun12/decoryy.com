import { Screen, SmoothScrollView } from '@/components/shell';
import { SELECT_LOCATION_HREF } from '@/lib/select-location-route';
import { HomeBannerCarousel } from '@/module/home/components/HomeBannerCarousel';
import { HomeDiscoveryFeed } from '@/module/home/components/HomeDiscoveryFeed';
import { HomeFeedSkeleton } from '@/module/home/components/HomeFeedSkeleton';
import { HomeStickyHeader } from '@/module/home/components/HomeStickyHeader';
import { useHomeCategories } from '@/module/home/hooks/use-home-categories';
import { useHomeCms } from '@/module/home/hooks/use-home-cms';
import { useHomeDeliveryBootstrap } from '@/module/home/hooks/use-home-delivery-bootstrap';
import { useHomeDiscovery } from '@/module/home/hooks/use-home-discovery';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import { useLocationStore } from '@/store/location.store';
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { RefreshControl } from 'react-native';

export function HomeScreen() {
  const openSelectLocation = useCallback(() => router.push(SELECT_LOCATION_HREF), []);
  const locationStatus = useLocationStore((s) => s.status);
  useHomeDeliveryBootstrap();
  const accessToken = useAuthStore((s) => s.accessToken);
  const loadCart = useCartStore((s) => s.loadFromApi);

  const {
    heroSlides,
    layoutBlocks,
    midSlide,
    endSlide,
    useCmsLayout,
    isPending: cmsPending,
    isRefetching: cmsRefetching,
    refetch: refetchCms,
  } = useHomeCms();

  const {
    categories,
    isPending: categoriesPending,
    refetch: refetchCategories,
  } = useHomeCategories();

  const {
    sections,
    isPending: discoveryPending,
    isRefetching: discoveryRefetching,
    refetch: refetchDiscovery,
  } = useHomeDiscovery();

  useFocusEffect(
    useCallback(() => {
      if (accessToken) {
        void loadCart();
      }
    }, [accessToken, loadCart]),
  );

  const discoveryLoading = categoriesPending || discoveryPending;
  const showSkeleton = locationStatus !== 'ready' || cmsPending;

  const refreshing =
    locationStatus === 'ready' &&
    (cmsRefetching || (!useCmsLayout && discoveryRefetching)) &&
    !showSkeleton;

  const onRefresh = useCallback(async () => {
    if (locationStatus !== 'ready') return;
    await refetchCms();
    await Promise.all([refetchDiscovery(), refetchCategories()]);
    if (accessToken) {
      await loadCart();
    }
  }, [
    accessToken,
    loadCart,
    locationStatus,
    refetchCategories,
    refetchCms,
    refetchDiscovery,
    useCmsLayout,
  ]);

  return (
    <Screen scroll={false} edges={['top']} contentClassName="flex-1">
      <HomeStickyHeader onLocationPress={openSelectLocation} />
      <SmoothScrollView
        contentContainerClassName="gap-4 pb-8 pt-2"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
        }>
        {showSkeleton ? (
          <HomeFeedSkeleton />
        ) : (
          <>
            <HomeBannerCarousel slides={heroSlides} />
            <HomeDiscoveryFeed
              useCmsLayout={useCmsLayout}
              layoutBlocks={layoutBlocks}
              midSlide={midSlide}
              endSlide={endSlide}
              categories={categories}
              sections={sections}
              discoveryLoading={discoveryLoading}
              cmsLoading={cmsPending}
            />
          </>
        )}
      </SmoothScrollView>
    </Screen>
  );
}
