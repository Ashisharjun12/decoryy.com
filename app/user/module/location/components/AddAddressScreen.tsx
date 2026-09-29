import { resolvePincode } from '@/api/geo.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Screen } from '@/components/shell';
import { CONFIRM_ADDRESS_MAP_HREF } from '@/lib/select-location-route';
import { LocationStackHeader } from '@/module/location/components/LocationStackHeader';
import {
  addressFormFromCustomer,
  emptyAddressForm,
  type AddressFormState,
} from '@/module/account/lib/address-form';
import { useAddressesQuery } from '@/module/account/hooks/use-addresses-query';
import { PlacesAddressAutocomplete } from '@/module/geo/components/PlacesAddressAutocomplete';
import { useAddressFormDraftStore } from '@/store/address-form-draft.store';
import { navigateBackOrHome } from '@/lib/navigate-back';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, Switch, View } from 'react-native';

export function AddAddressScreen() {
  const draftForm = useAddressFormDraftStore((s) => s.form);
  const editAddressId = useAddressFormDraftStore((s) => s.editAddressId);
  const setDraft = useAddressFormDraftStore((s) => s.setDraft);

  const { data: addresses = [] } = useAddressesQuery();
  const editAddress = editAddressId ? addresses.find((a) => a.id === editAddressId) : null;

  const [form, setForm] = useState<AddressFormState>(emptyAddressForm);
  const [pinMessage, setPinMessage] = useState('');
  const [pinOk, setPinOk] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const formSeededRef = useRef(false);

  useEffect(() => {
    formSeededRef.current = false;
  }, [editAddressId]);

  useEffect(() => {
    if (editAddress) {
      setForm(addressFormFromCustomer(editAddress));
      return;
    }
    if (formSeededRef.current) return;
    formSeededRef.current = true;
    if (draftForm.address || draftForm.pincode) {
      setForm({ ...emptyAddressForm, ...draftForm });
    }
  }, [editAddress, draftForm.address, draftForm.pincode]);

  useEffect(() => {
    const code = form.pincode.replace(/\D/g, '');
    if (code.length !== 6) {
      setPinOk(false);
      setPinMessage('');
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      void resolvePincode(code, form.cityId ? { cityId: form.cityId } : {})
        .then((data) => {
          if (cancelled) return;
          const row = data as {
            deliverable?: boolean;
            city?: { id: string; name: string };
          };
          if (!row?.deliverable || !row.city?.id) {
            setPinOk(false);
            setPinMessage('We do not deliver to this pincode yet');
            return;
          }
          setForm((f) => ({
            ...f,
            cityId: row.city!.id,
            cityName: row.city!.name,
          }));
          setPinOk(true);
          setPinMessage(`Delivering in ${row.city!.name}`);
        })
        .catch(() => {
          if (cancelled) return;
          setPinOk(false);
          setPinMessage('Could not verify pincode');
        });
    }, 280);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [form.pincode, form.cityId]);

  function validateDetails(): boolean {
    const errors: Record<string, string> = {};
    if (form.address.trim().length < 6) {
      errors.address = 'Add flat, street, and area (at least 6 characters).';
    }
    const pin = form.pincode.replace(/\D/g, '');
    if (pin.length !== 6) {
      errors.pincode = 'Enter a valid 6-digit PIN code.';
    } else if (!pinOk || !form.cityId) {
      errors.pincode = pinMessage || 'Pincode is not serviceable';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function openReviewMap() {
    if (!validateDetails()) return;
    setDraft(form, editAddressId);
    router.push(CONFIRM_ADDRESS_MAP_HREF);
  }

  const title = editAddress ? 'Edit address' : 'Add address';

  return (
    <Screen scroll={false} edges={['top', 'bottom']} contentClassName="flex-1">
      <LocationStackHeader title={title} onBack={navigateBackOrHome} />
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-4 pb-8 pt-4"
        keyboardShouldPersistTaps="always"
        nestedScrollEnabled
        keyboardDismissMode="on-drag">
        <Text className="text-muted-foreground text-sm leading-5">
          Enter your delivery details. Next you will review them on the map.
        </Text>

        <View className="gap-1.5">
          <Text className="text-foreground text-sm font-medium">Label</Text>
          <Input
            value={form.label}
            onChangeText={(label) => setForm((f) => ({ ...f, label }))}
            placeholder="Home, Office, Venue…"
            className="h-11"
          />
        </View>

        <View className="gap-1.5">
          <Text className="text-foreground text-sm font-medium">Search address</Text>
          <PlacesAddressAutocomplete
            dropdownLayout="inline"
            value={form.address}
            onChange={(address) =>
              setForm((f) => ({
                ...f,
                address,
                latitude: null,
                longitude: null,
              }))
            }
            onPlaceResolved={({ address, pincode, latitude, longitude }) => {
              setForm((f) => ({
                ...f,
                address,
                pincode: pincode ?? f.pincode,
                latitude: latitude || f.latitude,
                longitude: longitude || f.longitude,
              }));
            }}
            className="h-11"
          />
          {fieldErrors.address ? (
            <Text className="text-destructive text-xs">{fieldErrors.address}</Text>
          ) : (
            <Text className="text-muted-foreground text-xs">
              Pick a suggestion or type your full address
            </Text>
          )}
        </View>

        <View className="gap-1.5">
          <Text className="text-foreground text-sm font-medium">PIN code</Text>
          <Input
            value={form.pincode}
            onChangeText={(pincode) =>
              setForm((f) => ({
                ...f,
                pincode,
                latitude: null,
                longitude: null,
              }))
            }
            placeholder="560001"
            keyboardType="number-pad"
            maxLength={6}
            className="h-11"
          />
          {pinMessage ? (
            <Text className={pinOk ? 'text-muted-foreground text-xs' : 'text-destructive text-xs'}>
              {pinMessage}
            </Text>
          ) : null}
          {fieldErrors.pincode ? (
            <Text className="text-destructive text-xs">{fieldErrors.pincode}</Text>
          ) : null}
        </View>

        <View className="gap-1.5">
          <Text className="text-foreground text-sm font-medium">Landmark (optional)</Text>
          <Input
            value={form.landmark}
            onChangeText={(landmark) => setForm((f) => ({ ...f, landmark }))}
            placeholder="Near metro, gate no…"
            className="h-11"
          />
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-foreground text-sm font-medium">Set as default</Text>
          <Switch
            value={form.isDefault}
            onValueChange={(isDefault) => setForm((f) => ({ ...f, isDefault }))}
          />
        </View>

        <Button onPress={openReviewMap}>
          <Text>Review address on map</Text>
        </Button>
      </ScrollView>
    </Screen>
  );
}
