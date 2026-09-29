import { WhatsAppIcon } from '@/components/shell/WhatsAppIcon';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import type { CustomerAddress } from '@/api/addresses.api';
import { Screen } from '@/components/shell';
import { openWhatsAppSupport } from '@/lib/support-actions';
import { ADD_ADDRESS_HREF } from '@/lib/select-location-route';
import { LocationStackHeader } from '@/module/location/components/LocationStackHeader';
import { useAddressesQuery } from '@/module/account/hooks/use-addresses-query';
import { PlacesAddressAutocomplete } from '@/module/geo/components/PlacesAddressAutocomplete';
import { useAddressFormDraftStore } from '@/store/address-form-draft.store';
import { useDeliveryLocationStore } from '@/store/delivery-location.store';
import { useLocationStore } from '@/store/location.store';
import { emptyAddressForm } from '@/module/account/lib/address-form';
import { cn } from '@/lib/utils';
import { Briefcase, Crosshair, Home, MapPin, MoreVertical, Plane, Plus } from 'lucide-react-native';
import { navigateBackOrHome } from '@/lib/navigate-back';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Alert, Keyboard, Pressable, ScrollView, View } from 'react-native';
import { ScalePressable } from '@/components/shell';

function addressIcon(label: string) {
  const lower = label.toLowerCase();
  if (lower.includes('work') || lower.includes('office')) return Briefcase;
  if (lower.includes('home')) return Home;
  if (lower.includes('hotel') || lower.includes('pg')) return Plane;
  return MapPin;
}

function QuickAction({
  label,
  icon,
  iconSlot,
  onPress,
  loading,
  accent = 'primary',
}: {
  label: string;
  icon?: typeof Crosshair;
  iconSlot?: ReactNode;
  onPress: () => void;
  loading?: boolean;
  accent?: 'primary' | 'whatsapp';
}) {
  return (
    <ScalePressable
      onPress={onPress}
      disabled={loading}
      haptic
      className="flex-1 items-center rounded-2xl border border-border bg-card px-2 py-4 active:bg-muted/40">
      <View
        className={cn(
          'mb-2 size-11 items-center justify-center rounded-xl',
          accent === 'whatsapp' ? 'bg-emerald-500/15' : 'bg-primary/10',
        )}>
        {loading ? (
          <ActivityIndicator size="small" />
        ) : iconSlot ? (
          iconSlot
        ) : icon ? (
          <Icon
            as={icon}
            className={cn('size-6', accent === 'whatsapp' ? 'text-emerald-600' : 'text-primary')}
          />
        ) : null}
      </View>
      <Text className="text-foreground text-center text-xs font-semibold leading-4">{label}</Text>
    </ScalePressable>
  );
}

export function SelectLocationScreen() {
  const { data: addresses = [], isLoading } = useAddressesQuery();
  const selectedId = useDeliveryLocationStore((s) => s.selectedAddressId);
  const setFromAddress = useDeliveryLocationStore((s) => s.setFromAddress);
  const setDraft = useAddressFormDraftStore((s) => s.setDraft);

  const [searchLine, setSearchLine] = useState('');
  const [locating, setLocating] = useState(false);
  async function pickAddress(addr: CustomerAddress) {
    if (!addr.cityId) return;
    await setFromAddress(addr);
    navigateBackOrHome();
  }

  async function useCurrentLocation() {
    Keyboard.dismiss();
    setLocating(true);
    try {
      const ok = await useLocationStore.getState().detectLocationFromGps();
      if (ok) {
        navigateBackOrHome();
        return;
      }
      Alert.alert('Location', 'Allow location access or pick an address from the list.');
    } finally {
      setLocating(false);
    }
  }

  function openAddAddress() {
    Keyboard.dismiss();
    setDraft(emptyAddressForm);
    router.push(ADD_ADDRESS_HREF);
  }

  function onSearchPlaceResolved({
    address,
    pincode,
    latitude,
    longitude,
  }: {
    address: string;
    pincode: string | null;
    latitude: number;
    longitude: number;
  }) {
    setDraft({
      ...emptyAddressForm,
      address,
      pincode: pincode ?? '',
      latitude,
      longitude,
    });
    router.push(ADD_ADDRESS_HREF);
  }

  return (
    <Screen scroll={false} edges={['top', 'bottom']} contentClassName="flex-1">
      <LocationStackHeader title="Select Your Location" onBack={navigateBackOrHome} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-8 pt-4"
        keyboardShouldPersistTaps="always"
        nestedScrollEnabled
        keyboardDismissMode="on-drag"
        onScrollBeginDrag={() => Keyboard.dismiss()}>
        <View className="relative z-20 mb-4" style={{ zIndex: 20 }}>
          <PlacesAddressAutocomplete
            dropdownLayout="inline"
            value={searchLine}
            onChange={setSearchLine}
            onPlaceResolved={onSearchPlaceResolved}
            placeholder="Search an area or address"
            className="h-12 rounded-2xl"
          />
        </View>

        <View className="mb-6 flex-row gap-3">
          <QuickAction
            label="Use Current Location"
            icon={Crosshair}
            onPress={() => void useCurrentLocation()}
            loading={locating}
          />
          <QuickAction label="Add New Address" icon={Plus} onPress={openAddAddress} />
          <QuickAction
            label="Request Address"
            accent="whatsapp"
            iconSlot={<WhatsAppIcon size={24} color="#25D366" />}
            onPress={() => void openWhatsAppSupport()}
          />
        </View>

        {isLoading ? (
          <ActivityIndicator className="py-8" />
        ) : addresses.length > 0 ? (
          <View>
            <Text className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wide">
              Saved addresses
            </Text>
            <View className="overflow-hidden rounded-2xl border border-border bg-card">
              {addresses.map((addr, index) => {
                const IconComponent = addressIcon(addr.label);
                const selected = selectedId === addr.id;
                const isLast = index === addresses.length - 1;
                return (
                  <Pressable
                    key={addr.id}
                    onPress={() => void pickAddress(addr)}
                    className={cn('border-b border-border px-4 py-4', isLast && 'border-b-0')}>
                    <View className="flex-row gap-3">
                      <View className="items-center">
                        <View className="size-12 items-center justify-center rounded-xl bg-muted">
                          <Icon as={IconComponent} className="text-muted-foreground size-5" />
                        </View>
                      </View>
                      <View className="min-w-0 flex-1">
                        <View className="flex-row flex-wrap items-center gap-2">
                          <Text className="text-foreground font-semibold">{addr.label}</Text>
                          {selected ? (
                            <View className="rounded bg-emerald-600 px-1.5 py-0.5">
                              <Text className="text-[10px] font-bold uppercase text-white">
                                Selected
                              </Text>
                            </View>
                          ) : null}
                        </View>
                        <Text className="text-muted-foreground mt-1 text-sm leading-5" numberOfLines={2}>
                          {addr.address}
                          {addr.landmark ? `, ${addr.landmark}` : ''}, {addr.cityName} {addr.pincode}
                        </Text>
                      </View>
                      <Pressable
                        hitSlop={8}
                        onPress={() => {
                          setDraft(
                            {
                              label: addr.label,
                              address: addr.address,
                              landmark: addr.landmark ?? '',
                              pincode: addr.pincode,
                              cityName: addr.cityName,
                              cityId: addr.cityId,
                              isDefault: addr.isDefault,
                              latitude: addr.latitude,
                              longitude: addr.longitude,
                            },
                            addr.id,
                          );
                          router.push(ADD_ADDRESS_HREF);
                        }}>
                        <Icon as={MoreVertical} className="text-muted-foreground size-5" />
                      </Pressable>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : (
          <Text className="text-muted-foreground text-sm leading-6">
            No saved addresses yet. Add one or use your current location.
          </Text>
        )}
      </ScrollView>
    </Screen>
  );
}
