import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import type { CheckoutCustomerForm } from '@/module/booking/lib/checkout-form-types';
import { View } from 'react-native';

type CheckoutCustomerSectionProps = {
  value: CheckoutCustomerForm;
  onChange: (next: CheckoutCustomerForm) => void;
};

export function CheckoutCustomerSection({ value, onChange }: CheckoutCustomerSectionProps) {
  function patch<K extends keyof CheckoutCustomerForm>(key: K, next: CheckoutCustomerForm[K]) {
    onChange({ ...value, [key]: next });
  }

  return (
    <View className="gap-4 rounded-2xl border border-border bg-card p-4">
      <Text className="text-foreground text-base font-semibold">Your details</Text>
      <View className="gap-1.5">
        <Text className="text-muted-foreground text-xs font-medium">Full name</Text>
        <Input value={value.name} onChangeText={(t) => patch('name', t)} placeholder="Full name" />
      </View>
      <View className="gap-1.5">
        <Text className="text-muted-foreground text-xs font-medium">Phone</Text>
        <Input
          value={value.phone}
          onChangeText={(t) => patch('phone', t)}
          placeholder="10-digit mobile"
          keyboardType="phone-pad"
        />
      </View>
      <View className="gap-1.5">
        <Text className="text-muted-foreground text-xs font-medium">Email</Text>
        <Input
          value={value.email}
          onChangeText={(t) => patch('email', t)}
          placeholder="Email address"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
    </View>
  );
}
