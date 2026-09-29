import { getProductForCatalogLocation } from '@/lib/catalog-location';
import { queryKeys } from '@/lib/query-keys';
import { isBackendCityId } from '@/lib/location-label';
import { useLocationStore } from '@/store/location.store';
import { useQuery } from '@tanstack/react-query';
import type { CatalogProductDetail } from '@/module/catalog/lib/product-detail';

export const PRODUCT_DETAIL_STALE_MS = 120_000;

export function useProductDetailLocation() {
  const city = useLocationStore((s) => s.city);
  const pincode = useLocationStore((s) => s.pincode);
  const cityIdForGate = city?.id;
  const hasLocation =
    Boolean(pincode?.code) ||
    (Boolean(cityIdForGate) && isBackendCityId(cityIdForGate));
  return { hasLocation };
}

export function useProductDetailQuery(productId: string, { enabled = true } = {}) {
  const city = useLocationStore((s) => s.city);
  const pincode = useLocationStore((s) => s.pincode);

  const cityId = city?.id && isBackendCityId(city.id) ? city.id : undefined;
  const pincodeCode = pincode?.code?.replace(/\D/g, '').slice(0, 6) || undefined;
  const hasLocation = Boolean(pincodeCode || cityId);

  return useQuery({
    queryKey: queryKeys.productDetail(productId, cityId, pincodeCode),
    queryFn: () =>
      getProductForCatalogLocation(productId, {
        cityId,
        pincode: pincodeCode,
      }) as Promise<CatalogProductDetail>,
    enabled: Boolean(productId) && hasLocation && enabled,
    staleTime: PRODUCT_DETAIL_STALE_MS,
  });
}
