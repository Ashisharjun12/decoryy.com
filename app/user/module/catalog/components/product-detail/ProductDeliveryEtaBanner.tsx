import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Truck } from 'lucide-react-native';
import { View } from 'react-native';

export function ProductDeliveryEtaBanner() {
  return (
    <View className="flex-row items-start gap-3 rounded-2xl bg-emerald-50 px-3 py-3">
      <Icon as={Truck} className="mt-0.5 size-5 text-emerald-700" />
      <Text className="text-emerald-900 min-w-0 flex-1 text-sm leading-relaxed">
        Earliest delivery today by 2 PM. Choose faster delivery options at checkout.
      </Text>
    </View>
  );
}
