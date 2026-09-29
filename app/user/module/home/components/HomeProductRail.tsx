import { Text } from '@/components/ui/text';
import { HomeProductCard } from '@/module/home/components/HomeProductCard';
import type { HomeProductSection } from '@/module/home/lib/home-catalog';
import { ScrollView, View } from 'react-native';

type HomeProductRailProps = {
  section: HomeProductSection;
  showTitle?: boolean;
  showSubtitle?: boolean;
};

export function HomeProductRail({
  section,
  showTitle = true,
  showSubtitle = true,
}: HomeProductRailProps) {
  return (
    <View className="gap-3">
      {showTitle || (showSubtitle && section.subtitle) ? (
        <View className="gap-0.5 px-4">
          {showTitle ? (
            <Text className="text-foreground text-lg font-semibold">{section.title}</Text>
          ) : null}
          {showSubtitle && section.subtitle ? (
            <Text className="text-muted-foreground text-sm">{section.subtitle}</Text>
          ) : null}
        </View>
      ) : null}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-3 px-4">
        {section.items.map((product) => (
          <HomeProductCard
            key={product.id}
            product={product}
            badgeLabel={section.badgeLabel}
          />
        ))}
      </ScrollView>
    </View>
  );
}
