import { getApiError } from '@/api/client';
import { getProduct, listProducts } from '@/api/products.api';

type ListProductsParams = {
  pincode?: string;
  cityId?: string;
  categoryIds?: string[];
  minPricePaise?: number;
  maxPricePaise?: number;
  sort?: string;
  q?: string;
  instant?: boolean;
  page?: number;
  limit?: number;
};

export type CatalogLocationInput = {
  cityId?: string;
  pincode?: string;
};

export function normalizeCatalogPincode(pincode?: string): string | undefined {
  const pin = pincode?.replace(/\D/g, '').slice(0, 6);
  return pin || undefined;
}

export function isPincodeNotServiceableError(err: unknown): boolean {
  const msg = getApiError(err).toLowerCase();
  return msg.includes('pincode') && msg.includes('serviceable');
}

/** Cart / checkout location body (web LocationPicker.syncCartLocation). */
export function cartLocationBody({ cityId, pincode }: CatalogLocationInput) {
  const pin = normalizeCatalogPincode(pincode);
  if (!cityId) {
    return pin ? { pincode: pin } : {};
  }
  return pin ? { cityId, pincode: pin } : { cityId };
}

async function withCatalogLocationRetry<T>(
  attempt: (location: { cityId?: string; pincode?: string }) => Promise<T>,
  { cityId, pincode }: CatalogLocationInput,
): Promise<T> {
  const pin = normalizeCatalogPincode(pincode);

  if (cityId && pin) {
    try {
      return await attempt({ cityId, pincode: pin });
    } catch (err) {
      if (isPincodeNotServiceableError(err)) {
        return await attempt({ cityId, pincode: undefined });
      }
      throw err;
    }
  }

  if (pin) {
    return await attempt({ pincode: pin, cityId: undefined });
  }

  if (cityId) {
    return await attempt({ cityId, pincode: undefined });
  }

  throw new Error('pincode or cityId is required');
}

export async function getProductForCatalogLocation(
  productId: string,
  location: CatalogLocationInput,
) {
  return withCatalogLocationRetry(
    (loc) => getProduct(productId, loc),
    location,
  );
}

/** List products with cityId+pincode first; retry city-only when pincode is rejected. */
export async function listProductsForCatalogLocation(
  params: ListProductsParams & CatalogLocationInput,
) {
  const { cityId, pincode, ...rest } = params;
  return withCatalogLocationRetry(
    (loc) => listProducts({ ...rest, ...loc }),
    { cityId, pincode },
  );
}

export function catalogLocationErrorMessage(err: unknown): string {
  if (isPincodeNotServiceableError(err)) {
    return 'This pincode is not serviceable yet. Showing setups for your delivery city instead, or update your delivery location.';
  }
  return getApiError(err);
}
