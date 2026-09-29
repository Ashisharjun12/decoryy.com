import { Text } from '@/components/ui/text';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { CheckoutPaymentMethod } from '@/module/booking/lib/checkout-form-types';
import { View } from 'react-native';

type CheckoutPaymentSectionProps = {
  value: CheckoutPaymentMethod;
  onChange: (value: CheckoutPaymentMethod) => void;
  allowCod: boolean;
  allowOnline: boolean;
  paymentWarning?: string | null;
};

export function CheckoutPaymentSection({
  value,
  onChange,
  allowCod,
  allowOnline,
  paymentWarning,
}: CheckoutPaymentSectionProps) {
  if (!allowCod && !allowOnline) {
    return (
      <View className="rounded-2xl border border-border bg-card p-4">
        <Text className="text-muted-foreground text-sm">
          No payment method is available for items in this bag.
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-3">
      <Text className="text-foreground text-base font-semibold">Payment</Text>
      <RadioGroup
        value={value || undefined}
        onValueChange={(v) => onChange(v as CheckoutPaymentMethod)}
        className="gap-3">
        {allowOnline ? (
          <View className="flex-row items-start gap-3 rounded-2xl border border-border bg-card p-4">
            <RadioGroupItem value="online" />
            <View className="min-w-0 flex-1">
              <Text className="text-foreground font-semibold">Pay online</Text>
              <Text className="text-muted-foreground mt-0.5 text-sm">UPI, card, or net banking.</Text>
            </View>
          </View>
        ) : null}
        {allowCod ? (
          <View className="flex-row items-start gap-3 rounded-2xl border border-border bg-card p-4">
            <RadioGroupItem value="cod" />
            <View className="min-w-0 flex-1">
              <Text className="text-foreground font-semibold">Cash on delivery</Text>
              <Text className="text-muted-foreground mt-0.5 text-sm">Pay after setup. No charge yet.</Text>
            </View>
          </View>
        ) : null}
      </RadioGroup>
      {paymentWarning ? (
        <Text className="text-destructive text-xs">{paymentWarning}</Text>
      ) : null}
    </View>
  );
}
