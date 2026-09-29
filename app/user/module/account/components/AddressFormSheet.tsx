import { resolvePincode } from '@/api/geo.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { getApiError } from '@/api/client';
import {
  addressFormFromCustomer,
  buildCreateAddressBody,
  emptyAddressForm,
  type AddressFormState,
} from '@/module/account/lib/address-form';
import { useAddressMutations } from '@/module/account/hooks/use-addresses-query';
import type { CustomerAddress } from '@/api/addresses.api';
import { PlacesAddressAutocomplete } from '@/module/geo/components/PlacesAddressAutocomplete';
import { HomeBottomSheetModal } from '@/module/home/components/HomeBottomSheetModal';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Switch, View } from 'react-native';

type AddressFormSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSaved?: (address: CustomerAddress) => void;
  editAddress?: CustomerAddress | null;
  title?: string;
};

export function AddressFormSheet({
  visible,
  onClose,
  onSaved,
  editAddress = null,
  title,
}: AddressFormSheetProps) {
  const { create, update } = useAddressMutations();
  const [form, setForm] = useState<AddressFormState>(emptyAddressForm);
  const [pinMessage, setPinMessage] = useState('');
  const [pinOk, setPinOk] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!visible) return;
    setForm(editAddress ? addressFormFromCustomer(editAddress) : emptyAddressForm);
    setFieldErrors({});
    setPinMessage(editAddress?.cityName ? `Delivering in ${editAddress.cityName}` : '');
    setPinOk(Boolean(editAddress?.cityId && editAddress.pincode?.length === 6));
  }, [visible, editAddress]);

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
        .catch((err) => {
          if (cancelled) return;
          setPinOk(false);
          setPinMessage(getApiError(err));
        });
    }, 280);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [form.pincode, form.cityId]);

  function validate(): boolean {
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
    if (form.latitude == null || form.longitude == null) {
      errors.address =
        errors.address ?? 'Pick an address from search so we can locate it on the map.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (editAddress?.id) {
        const body = buildCreateAddressBody(form);
        if (!body) return;
        const saved = await update.mutateAsync({
          id: editAddress.id,
          body: {
            label: body.label,
            address: body.address,
            landmark: body.landmark,
            pincode: body.pincode,
            cityId: body.cityId,
            cityName: body.cityName,
            latitude: body.latitude,
            longitude: body.longitude,
            geoSource: body.geoSource,
            setDefault: body.setDefault,
          },
        });
        onSaved?.(saved);
        onClose();
        return;
      }
      const body = buildCreateAddressBody(form);
      if (!body) return;
      const saved = await create.mutateAsync(body);
      onSaved?.(saved);
      onClose();
    } catch (err) {
      Alert.alert('Could not save address', getApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  const heading = title ?? (editAddress ? 'Edit address' : 'Add new address');

  return (
    <HomeBottomSheetModal
      visible={visible}
      onClose={onClose}
      closeAccessibilityLabel="Close address form">
      <ScrollView
        className="max-h-[85%] px-4 pb-6 pt-3"
        keyboardShouldPersistTaps="always"
        nestedScrollEnabled>
        <Text className="text-foreground mb-4 text-lg font-semibold">{heading}</Text>

        <View className="mb-3 gap-1.5">
          <Text className="text-foreground text-sm font-medium">Label</Text>
          <Input
            value={form.label}
            onChangeText={(label) => setForm((f) => ({ ...f, label }))}
            placeholder="Home, Office, Venue…"
            className="h-11"
          />
        </View>

        <View className="mb-3 gap-1.5">
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
                latitude,
                longitude,
              }));
            }}
            className="h-11"
          />
          {fieldErrors.address ? (
            <Text className="text-destructive text-xs">{fieldErrors.address}</Text>
          ) : null}
        </View>

        <View className="mb-3 gap-1.5">
          <Text className="text-foreground text-sm font-medium">Landmark (optional)</Text>
          <Input
            value={form.landmark}
            onChangeText={(landmark) => setForm((f) => ({ ...f, landmark }))}
            placeholder="Near metro, gate no…"
            className="h-11"
          />
        </View>

        <View className="mb-3 gap-1.5">
          <Text className="text-foreground text-sm font-medium">PIN code</Text>
          <Input
            value={form.pincode}
            onChangeText={(pincode) => setForm((f) => ({ ...f, pincode }))}
            placeholder="6-digit pincode"
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

        <View className="mb-5 flex-row items-center justify-between">
          <Text className="text-foreground text-sm font-medium">Set as default</Text>
          <Switch
            value={form.isDefault}
            onValueChange={(isDefault) => setForm((f) => ({ ...f, isDefault }))}
          />
        </View>

        <Button onPress={() => void handleSave()} disabled={submitting}>
          <Text>{submitting ? 'Saving…' : 'Save address'}</Text>
        </Button>
      </ScrollView>
    </HomeBottomSheetModal>
  );
}
