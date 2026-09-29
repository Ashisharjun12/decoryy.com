import { ScalePressable } from '@/components/shell';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { HomeProductCard } from '@/module/home/components/HomeProductCard';
import type { HomeCatalogProduct } from '@/module/home/lib/home-catalog';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native';

type ProductPdpProductRailProps = {
  title: string;
  subtitle: string;
  items: HomeCatalogProduct[];
  loading?: boolean;
  /** Tighter top spacing when this rail follows another PDP product rail */
  stackedBelowRail?: boolean;
  className?: string;
};

function sectionSpacingClass(stackedBelowRail?: boolean) {
  return stackedBelowRail
    ? 'mt-4 gap-3 border-t border-border/60 pt-5'
    : 'gap-3 border-t border-border/60 pt-8';
}

function PdpRailScrollControls({
  canPrev,
  canNext,
  onPrev,
  onNext,
}: {
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  const btnClass =
    'size-8 items-center justify-center rounded-full bg-amber-400 active:bg-amber-500';
  const disabledClass = 'opacity-40';

  return (
    <View className="flex-row items-center gap-1.5">
      <ScalePressable
        onPress={onPrev}
        disabled={!canPrev}
        haptic
        className={`${btnClass} ${!canPrev ? disabledClass : ''}`}
        accessibilityRole="button"
        accessibilityLabel="Scroll left">
        <Icon as={ChevronLeft} className="text-amber-950 size-4" strokeWidth={2.5} />
      </ScalePressable>
      <ScalePressable
        onPress={onNext}
        disabled={!canNext}
        haptic
        className={`${btnClass} ${!canNext ? disabledClass : ''}`}
        accessibilityRole="button"
        accessibilityLabel="Scroll right">
        <Icon as={ChevronRight} className="text-amber-950 size-4" strokeWidth={2.5} />
      </ScalePressable>
    </View>
  );
}

export function ProductPdpProductRail({
  title,
  subtitle,
  items,
  loading,
  stackedBelowRail,
  className,
}: ProductPdpProductRailProps) {
  const scrollRef = useRef<ScrollView>(null);
  const scrollXRef = useRef(0);
  const viewportWidthRef = useRef(0);
  const contentWidthRef = useRef(0);
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = Math.round(screenWidth * 0.38);

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateScrollState = useCallback(() => {
    const viewport = viewportWidthRef.current;
    const content = contentWidthRef.current;
    const x = scrollXRef.current;
    const hasOverflow = content > viewport + 2;
    setCanPrev(hasOverflow && x > 2);
    setCanNext(hasOverflow && x + viewport < content - 2);
  }, []);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollXRef.current = e.nativeEvent.contentOffset.x;
      updateScrollState();
    },
    [updateScrollState],
  );

  function scrollByPage(direction: number) {
    const viewport = viewportWidthRef.current || screenWidth;
    const nextX = Math.max(0, scrollXRef.current + direction * viewport * 0.85);
    scrollRef.current?.scrollTo({ x: nextX, animated: true });
  }

  if (loading) {
    return (
      <View className={cn(sectionSpacingClass(stackedBelowRail), className)}>
        <Text className="text-foreground text-lg font-semibold">{title}</Text>
        <View className="h-44 rounded-2xl bg-muted" style={{ width: cardWidth }} />
      </View>
    );
  }

  if (!items.length) return null;

  const showControls = items.length >= 3;

  return (
    <View className={cn(sectionSpacingClass(stackedBelowRail), className)}>
      <View className="flex-row items-start justify-between gap-2">
        <View className="min-w-0 flex-1 gap-0.5">
          <Text className="text-foreground text-lg font-semibold">{title}</Text>
          <Text className="text-muted-foreground text-sm">{subtitle}</Text>
        </View>
        {showControls ? (
          <PdpRailScrollControls
            canPrev={canPrev}
            canNext={canNext}
            onPrev={() => scrollByPage(-1)}
            onNext={() => scrollByPage(1)}
          />
        ) : null}
      </View>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onLayout={(e) => {
          viewportWidthRef.current = e.nativeEvent.layout.width;
          updateScrollState();
        }}
        onContentSizeChange={(w) => {
          contentWidthRef.current = w;
          updateScrollState();
        }}
        contentContainerClassName="gap-2.5">
        {items.map((product) => (
          <View key={product.id} style={{ width: cardWidth }}>
            <HomeProductCard product={product} compact />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
