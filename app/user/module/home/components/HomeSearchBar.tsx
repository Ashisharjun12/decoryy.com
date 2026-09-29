import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ScalePressable } from '@/components/shell';
import { formatLocationLabel } from '@/lib/location-label';
import { HomeBottomSheetModal } from '@/module/home/components/HomeBottomSheetModal';
import { HomeCityPickerSheet } from '@/module/home/components/HomeCityPickerSheet';
import { HOME_CITY_MAP_ICON_URI } from '@/module/home/lib/home-assets';
import { useLocationStore } from '@/store/location.store';
import { Image } from 'expo-image';
import { Href, router } from 'expo-router';
import { Search } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

export function HomeSearchBar() {
  const [cityOpen, setCityOpen] = useState(false);
  const fetchCities = useLocationStore((s) => s.fetchCities);
  const city = useLocationStore((s) => s.city);
  const pincode = useLocationStore((s) => s.pincode);
  const cityLabel = formatLocationLabel(city, pincode);

  useEffect(() => {
    void fetchCities();
  }, [fetchCities]);

  useEffect(() => {
    if (!cityOpen) return;
    void fetchCities();
  }, [cityOpen, fetchCities]);

  return (
    <>
      <View className="flex-row items-stretch overflow-hidden rounded-xl border border-border bg-muted/40">
        <ScalePressable
          onPress={() => router.push('/(app)/search' as Href)}
          haptic
          className="min-w-0 flex-1 flex-row items-center gap-2 px-3 py-3"
          accessibilityRole="button"
          accessibilityLabel="Search decorations">
          <Icon as={Search} className="text-muted-foreground size-5 shrink-0" />
          <Text className="text-muted-foreground flex-1 text-sm" numberOfLines={1}>
            Search decorations or occasions
          </Text>
        </ScalePressable>
        <View className="my-2.5 w-px bg-border" />
        <ScalePressable
          onPress={() => setCityOpen(true)}
          haptic
          hitSlop={4}
          className="max-w-[7.5rem] flex-row items-center justify-center gap-1 px-2.5"
          accessibilityRole="button"
          accessibilityLabel={city ? `City: ${city.name}. Change city` : 'Select city'}>
          <Image
            source={{ uri: HOME_CITY_MAP_ICON_URI }}
            style={{ width: 22, height: 26 }}
            contentFit="contain"
            accessibilityIgnoresInvertColors
          />
          <Text className="text-foreground min-w-0 flex-1 text-xs font-semibold" numberOfLines={1}>
            {city?.name ?? 'City'}
          </Text>
        </ScalePressable>
      </View>

      <HomeBottomSheetModal
        visible={cityOpen}
        onClose={() => setCityOpen(false)}
        closeAccessibilityLabel="Close city picker">
        <HomeCityPickerSheet
          onClose={() => setCityOpen(false)}
          currentLabel={cityLabel}
        />
      </HomeBottomSheetModal>
    </>
  );
}
