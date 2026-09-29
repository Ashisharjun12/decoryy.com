import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import type { ProductFaq } from '@/module/catalog/lib/product-pdp-helpers';
import { Check } from 'lucide-react-native';
import { View } from 'react-native';

export type PdpDetailTabId = 'includes' | 'faqs' | 'delivery' | 'care';

type ProductPdpDetailPanelProps = {
  tab: PdpDetailTabId;
  includePoints: string[];
  faqItems: ProductFaq[];
  deliveryPoints: string[];
  carePoints: string[];
};

function IncludedList({ items }: { items: string[] }) {
  if (!items.length) {
    return <Text className="text-muted-foreground text-sm">Details coming soon</Text>;
  }
  return (
    <View className="gap-3">
      {items.map((point, index) => (
        <View key={`${index}-${point}`} className="flex-row gap-2">
          <View className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-600/15">
            <Icon as={Check} className="text-emerald-600 size-3.5" />
          </View>
          <Text className="text-foreground flex-1 text-sm">{point}</Text>
        </View>
      ))}
    </View>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (!items.length) {
    return <Text className="text-muted-foreground text-sm">Details coming soon</Text>;
  }
  return (
    <View className="gap-2 pl-1">
      {items.map((point, index) => (
        <Text key={`${index}-${point}`} className="text-foreground text-sm leading-relaxed">
          • {point}
        </Text>
      ))}
    </View>
  );
}

function FaqList({ items }: { items: ProductFaq[] }) {
  if (!items.length) {
    return <Text className="text-muted-foreground text-sm">Details coming soon</Text>;
  }
  return (
    <View className="gap-2">
      {items.map((item, index) => (
        <View key={item.key ?? index} className="bg-muted rounded-2xl p-3">
          <Text className="text-foreground text-sm font-medium">{item.question?.trim()}</Text>
          <Text className="text-muted-foreground mt-1 text-sm leading-relaxed">
            {item.answer?.trim()}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function ProductPdpDetailPanel({
  tab,
  includePoints,
  faqItems,
  deliveryPoints,
  carePoints,
}: ProductPdpDetailPanelProps) {
  if (tab === 'includes') return <IncludedList items={includePoints} />;
  if (tab === 'faqs') return <FaqList items={faqItems} />;
  if (tab === 'delivery') return <BulletList items={deliveryPoints} />;
  return <BulletList items={carePoints} />;
}
