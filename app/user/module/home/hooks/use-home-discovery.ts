import { listProductsForCatalogLocation } from '@/lib/catalog-location';
import { listSections } from '@/api/sections.api';
import { queryKeys } from '@/lib/query-keys';
import {
  normalizeApiSections,
  normalizeProduct,
  type HomeProductSection,
} from '@/module/home/lib/home-catalog';
import { useHomeCatalogCityId } from '@/module/home/hooks/use-home-catalog-city-id';
import { useLocationStore } from '@/store/location.store';
import { useQuery } from '@tanstack/react-query';

export function useHomeDiscovery() {
  const { catalogCityId, catalogPincode } = useHomeCatalogCityId();
  const status = useLocationStore((s) => s.status);

  const query = useQuery({
    queryKey: queryKeys.homeSections(catalogCityId ?? null, catalogPincode ?? null),
    queryFn: async (): Promise<HomeProductSection[]> => {
      const locationQuery = {
        cityId: catalogCityId,
        pincode: catalogPincode,
      };

      const sectionData = await listSections(locationQuery);
      const fromSections = normalizeApiSections(sectionData);
      if (fromSections.length > 0) {
        return fromSections;
      }

      const catalog = await listProductsForCatalogLocation({
        ...locationQuery,
        page: 1,
        limit: 16,
      });
      const items = ((catalog as { items?: unknown[] })?.items ?? [])
        .map(normalizeProduct)
        .filter(Boolean);
      if (items.length === 0) return [];

      return [
        {
          id: 'popular',
          slug: 'popular',
          title: 'Popular near you',
          subtitle: 'Top picks in your area',
          items: items as HomeProductSection['items'],
        },
      ];
    },
    enabled: status === 'ready' && Boolean(catalogCityId),
    staleTime: 60_000,
    placeholderData: (previous) => previous,
  });

  const locationReady = status === 'ready';

  return {
    sections: query.data ?? [],
    isPending: locationReady && query.isPending,
    isRefetching: locationReady && query.isRefetching,
    refetch: query.refetch,
    isError: query.isError,
  };
}
