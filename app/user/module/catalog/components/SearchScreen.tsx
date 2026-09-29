import { ScalePressable } from '@/components/shell';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { isBackendCityId } from '@/lib/location-label';
import { HomeLocationSheet } from '@/module/home/components/HomeLocationSheet';
import { useHomeCategories } from '@/module/home/hooks/use-home-categories';
import {
  SearchProductRow,
  SearchProductRowSkeleton,
} from '@/module/catalog/components/SearchProductRow';
import {
  MIN_QUERY_LEN,
  useProductSearchQuery,
} from '@/module/catalog/hooks/use-product-search-query';
import {
  buildCategorySearchIndex,
  categoryIdsForSearchHits,
  filterCategorySearchHits,
  preferCategoryProductFilter,
} from '@/module/catalog/lib/search-category-suggestions';
import { useLocationStore } from '@/store/location.store';
import { type Href, router } from 'expo-router';
import { ArrowLeft, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';

const MODAL_CATEGORY_LIMIT = 4;
const MODAL_CATEGORY_SEARCH_LIMIT = 5;

function HighlightMatch({ text, query }: { text: string; query: string }) {
  const trimmed = query.trim();
  if (!trimmed) {
    return <Text className="text-foreground">{text}</Text>;
  }
  const lower = text.toLowerCase();
  const q = trimmed.toLowerCase();
  const index = lower.indexOf(q);
  if (index < 0) {
    return <Text className="text-muted-foreground">{text}</Text>;
  }
  return (
    <Text className="text-muted-foreground">
      {text.slice(0, index)}
      <Text className="font-semibold text-foreground">{text.slice(index, index + trimmed.length)}</Text>
      {text.slice(index + trimmed.length)}
    </Text>
  );
}

export function SearchScreen() {
  const [query, setQuery] = useState('');
  const [locationOpen, setLocationOpen] = useState(false);

  const city = useLocationStore((s) => s.city);
  const pincode = useLocationStore((s) => s.pincode);
  const cityId = city?.id && isBackendCityId(city.id) ? city.id : undefined;
  const pincodeCode = pincode?.code?.replace(/\D/g, '').slice(0, 6) || undefined;
  const hasLocation = Boolean(pincodeCode || cityId);

  const { categories } = useHomeCategories();

  const categorySearchIndex = useMemo(
    () => buildCategorySearchIndex(categories),
    [categories],
  );

  const categorySuggestions = useMemo(() => {
    const limit = query.trim() ? MODAL_CATEGORY_SEARCH_LIMIT : MODAL_CATEGORY_LIMIT;
    return filterCategorySearchHits(categorySearchIndex, query, { limit });
  }, [categorySearchIndex, query]);

  const categoryHitsForProducts = useMemo(() => {
    if (query.trim().length < MIN_QUERY_LEN) return [];
    return filterCategorySearchHits(categorySearchIndex, query, {
      limit: MODAL_CATEGORY_SEARCH_LIMIT,
    });
  }, [categorySearchIndex, query]);

  const productCategoryIds = useMemo(() => {
    const ids = categoryIdsForSearchHits(categoryHitsForProducts);
    return ids.length > 0 ? ids : undefined;
  }, [categoryHitsForProducts]);

  const categoryScopedProductSearch = useMemo(
    () => preferCategoryProductFilter(categoryHitsForProducts, query),
    [categoryHitsForProducts, query],
  );

  const { data: products = [], isLoading, isFetching, isError } = useProductSearchQuery(query, {
    enabled: hasLocation,
    categoryIds: productCategoryIds,
    categoryScopedSearch: categoryScopedProductSearch,
  });

  const productHeading = query.trim().length < MIN_QUERY_LEN ? 'Popular setups' : 'Results';
  const showSkeletons = (isLoading || isFetching) && products.length === 0;
  const showEmpty =
    !showSkeletons && !isLoading && products.length === 0 && hasLocation && !isError;

  function openCategory(hit: { parent: { slug: string }; child: { slug: string } | null }) {
    const parentSlug = hit.parent.slug;
    const childSlug = hit.child?.slug;
    if (childSlug) {
      router.push(
        `/(app)/category?parentSlug=${encodeURIComponent(parentSlug)}&childSlug=${encodeURIComponent(childSlug)}` as Href,
      );
    } else {
      router.push(`/(app)/category?parentSlug=${encodeURIComponent(parentSlug)}` as Href);
    }
  }

  return (
    <View className="flex-1">
      <View className="border-b border-border/70 bg-background px-5 pb-3 pt-3">
        <View className="flex-row items-center gap-2">
          <ScalePressable
            onPress={() => router.back()}
            haptic
            className="p-1"
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <Icon as={ArrowLeft} className="text-foreground size-6" />
          </ScalePressable>
          <View className="relative min-w-0 flex-1 flex-row items-center">
            <Icon
              as={Search}
              className="text-muted-foreground absolute left-3 z-10 size-5"
            />
            <Input
              value={query}
              onChangeText={setQuery}
              placeholder="Search setups and occasions"
              className="h-11 flex-1 rounded-2xl border-border/60 bg-muted/40 pl-10 pr-3"
              autoFocus
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>
      </View>

      {!hasLocation ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-foreground text-center text-sm font-medium">Pick your city</Text>
          <Text className="text-muted-foreground mt-1 text-center text-sm">
            We need a serviceable city to search local setups.
          </Text>
          <Button className="mt-4 rounded-lg" onPress={() => setLocationOpen(true)}>
            <Text>Select city</Text>
          </Button>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-28"
          keyboardShouldPersistTaps="handled">
          {categorySuggestions.length > 0 ? (
            <View className="px-5 pb-1 pt-3">
              <Text className="text-muted-foreground py-1.5 text-xs font-medium uppercase tracking-wide">
                {query.trim() ? 'Categories' : 'Suggestions'}
              </Text>
              {categorySuggestions.map((hit) => (
                <ScalePressable
                  key={hit.id}
                  onPress={() => openCategory(hit)}
                  haptic
                  className="flex-row items-center gap-3 rounded-xl py-2.5 active:bg-muted/80">
                  <Icon as={Search} className="text-muted-foreground/70 size-4 shrink-0" />
                  <View className="min-w-0 flex-1">
                    <Text className="text-sm" numberOfLines={1}>
                      <HighlightMatch text={hit.label} query={query} />
                    </Text>
                    {hit.child ? (
                      <Text className="text-muted-foreground text-xs" numberOfLines={1}>
                        in {hit.parent.name}
                      </Text>
                    ) : null}
                  </View>
                </ScalePressable>
              ))}
            </View>
          ) : null}

          <View
            className={`px-5 pt-2 ${categorySuggestions.length > 0 ? 'mt-1 border-t border-border/50' : ''}`}>
            <Text className="text-muted-foreground py-1.5 text-xs font-medium uppercase tracking-wide">
              {productHeading}
            </Text>
            {showSkeletons ? (
              <View className="pb-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SearchProductRowSkeleton key={i} />
                ))}
              </View>
            ) : null}
            {products.map((product) => (
              <SearchProductRow
                key={product.id}
                product={product}
                onPress={() => router.push(`/(app)/product/${product.id}` as Href)}
              />
            ))}
            {showEmpty ? (
              <Text className="text-muted-foreground px-2 py-6 text-center text-sm">
                No setups found. Try another search or category.
              </Text>
            ) : null}
            {isError ? (
              <Text className="text-destructive px-2 py-6 text-center text-sm">
                Could not load products. Try again.
              </Text>
            ) : null}
          </View>
        </ScrollView>
      )}

      <Modal
        visible={locationOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setLocationOpen(false)}>
        <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setLocationOpen(false)}>
          <Pressable
            className="rounded-t-3xl bg-background pb-8"
            onPress={(e) => e.stopPropagation()}>
            <HomeLocationSheet onClose={() => setLocationOpen(false)} />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
