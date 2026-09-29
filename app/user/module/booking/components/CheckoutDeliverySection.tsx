import { ScalePressable } from '@/components/shell';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { resolvePincode } from '@/api/geo.api';
import type { CustomerAddress } from '@/api/addresses.api';
import type { CheckoutDeliveryForm } from '@/module/booking/lib/checkout-form-types';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { useCallback, useEffect, useRef } from 'react';
import { View } from 'react-native';

type CheckoutDeliverySectionProps = {
  value: CheckoutDeliveryForm;
  onChange: (next: CheckoutDeliveryForm) => void;
  addresses: CustomerAddress[];
  cartPincode?: string | null;
};

export function CheckoutDeliverySection({
  value,
  onChange,
  addresses,
  cartPincode,
}: CheckoutDeliverySectionProps) {
  const resolveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!cartPincode || value.pincode) return;
    onChange({ ...value, pincode: String(cartPincode).replace(/\D/g, '').slice(0, 6) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartPincode]);

  const resolvePin = useCallback(
    (pin: string) => {
      const digits = pin.replace(/\D/g, '').slice(0, 6);
      if (digits.length !== 6) {
        onChange({ ...value, pincode: digits, pinStatus: 'idle', pinMessage: '' });
        return;
      }
      onChange({ ...value, pincode: digits, pinStatus: 'idle', pinMessage: 'Checking…' });
      void resolvePincode(digits, { cityId: value.cityId ?? undefined })
        .then((data) => {
          const cityId = (data as { cityId?: string })?.cityId;
          const cityName = (data as { cityName?: string })?.cityName ?? '';
          if (!cityId) {
            onChange({
              ...value,
              pincode: digits,
              pinStatus: 'error',
              pinMessage: 'PIN not serviceable',
              cityId: null,
            });
            return;
          }
          onChange({
            ...value,
            pincode: digits,
            pinStatus: 'ok',
            pinMessage: '',
            cityId,
            cityName,
          });
        })
        .catch(() => {
          onChange({
            ...value,
            pincode: digits,
            pinStatus: 'error',
            pinMessage: 'PIN not serviceable',
            cityId: null,
          });
        });
    },
    [onChange, value],
  );

  function onPinChange(text: string) {
    const digits = text.replace(/\D/g, '').slice(0, 6);
    onChange({ ...value, pincode: digits, pinStatus: 'idle', pinMessage: '' });
    if (resolveTimer.current) clearTimeout(resolveTimer.current);
    if (digits.length === 6) {
      resolveTimer.current = setTimeout(() => resolvePin(digits), 400);
    }
  }

  function selectAddress(addr: CustomerAddress) {
    onChange({
      ...value,
      pincode: addr.pincode.replace(/\D/g, '').slice(0, 6),
      address: addr.address,
      landmark: addr.landmark ?? '',
      cityName: addr.cityName,
      cityId: addr.cityId,
      pinStatus: addr.cityId ? 'ok' : 'idle',
      pinMessage: '',
      latitude: addr.latitude,
      longitude: addr.longitude,
      deliveryGeoConfirmed: addr.latitude != null && addr.longitude != null,
    });
  }

  return (
    <View className="gap-3">
      <Text className="text-foreground text-base font-semibold">Delivery</Text>
      {addresses.length > 0 ? (
        <View className="gap-2">
          {addresses.slice(0, 4).map((addr) => (
            <ScalePressable
              key={addr.id}
              haptic
              onPress={() => selectAddress(addr)}
              className={cn(
                'flex-row items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3',
              )}>
              <View className="min-w-0 flex-1">
                <Text className="text-foreground text-sm font-semibold">{addr.label}</Text>
                <Text className="text-muted-foreground mt-0.5 text-xs" numberOfLines={2}>
                  {addr.address}, {addr.pincode}
                </Text>
              </View>
              <Icon as={ChevronRight} className="text-muted-foreground size-5" />
            </ScalePressable>
          ))}
        </View>
      ) : null}
      <View className="gap-3 rounded-2xl border border-border bg-card p-4">
        <View className="gap-1.5">
          <Text className="text-muted-foreground text-xs font-medium">PIN code</Text>
          <Input
            value={value.pincode}
            onChangeText={onPinChange}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="6-digit PIN"
          />
          {value.pinMessage ? (
            <Text
              className={cn(
                'text-xs',
                value.pinStatus === 'error' ? 'text-destructive' : 'text-muted-foreground',
              )}>
              {value.pinMessage}
            </Text>
          ) : null}
        </View>
        <View className="gap-1.5">
          <Text className="text-muted-foreground text-xs font-medium">Full address</Text>
          <Input
            value={value.address}
            onChangeText={(t) => onChange({ ...value, address: t })}
            placeholder="House, street, area"
            multiline
          />
        </View>
        <View className="gap-1.5">
          <Text className="text-muted-foreground text-xs font-medium">Landmark (optional)</Text>
          <Input
            value={value.landmark}
            onChangeText={(t) => onChange({ ...value, landmark: t })}
            placeholder="Near…"
          />
        </View>
      </View>
    </View>
  );
}
