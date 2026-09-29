export const queryKeys = {
  cmsHome: (cityId: string | null, pincode: string | null) =>
    ['cms', 'home', 'mobile', cityId, pincode] as const,
  homeSections: (cityId: string | null, pincode: string | null) =>
    ['catalog', 'sections', cityId, pincode] as const,
  categories: () => ['catalog', 'categories'] as const,
  productSearch: (
    cityId: string | null | undefined,
    pincode: string | null | undefined,
    q: string,
    categoryIds?: string[],
  ) =>
    [
      'catalog',
      'product-search',
      cityId ?? '_',
      pincode ?? '_',
      q ?? '',
      categoryIds?.length ? categoryIds.join(',') : '_',
    ] as const,
  catalogListing: (
    cityId: string | null | undefined,
    pincode: string | null | undefined,
    categoryIdsKey: string,
    sort: string,
    minPriceRupees: number | null,
    maxPriceRupees: number | null,
    page: number,
    limit: number,
    instantOnly = false,
  ) =>
    [
      'catalog',
      'listing',
      cityId ?? '_',
      pincode ?? '_',
      instantOnly ? 'instant' : categoryIdsKey,
      sort,
      minPriceRupees ?? '_',
      maxPriceRupees ?? '_',
      page,
      limit,
    ] as const,
  cities: () => ['geo', 'cities'] as const,
  addresses: () => ['user', 'addresses'] as const,
  productDetail: (
    productId: string | undefined,
    cityId: string | null | undefined,
    pincode: string | null | undefined,
  ) => ['catalog', 'product', productId ?? '_', cityId ?? '_', pincode ?? '_'] as const,
  similarProducts: (
    productId: string,
    categoryId: string,
    cityId: string | null | undefined,
    pincode: string | null | undefined,
  ) =>
    ['catalog', 'similar', productId, categoryId, cityId ?? '_', pincode ?? '_'] as const,
  otherCategoryProducts: (
    productId: string,
    categoryId: string,
    cityId: string | null | undefined,
    pincode: string | null | undefined,
  ) =>
    [
      'catalog',
      'other-categories',
      productId,
      categoryId,
      cityId ?? '_',
      pincode ?? '_',
    ] as const,
  productReviews: (productId: string, limit: number) =>
    ['catalog', 'product-reviews', productId, limit] as const,
  cart: () => ['cart'] as const,
  availableCoupons: (
    productId: string | undefined,
    categoryId: string | undefined,
    cityId: string | null | undefined,
    pincode: string | null | undefined,
    scope: string,
  ) =>
    [
      'promotions',
      'coupons',
      productId ?? '_',
      categoryId ?? '_',
      cityId ?? '_',
      pincode ?? '_',
      scope,
    ] as const,
};
