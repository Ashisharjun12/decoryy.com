import { ProductPdpProductRail } from '@/module/catalog/components/ProductPdpProductRail';
import type { HomeCatalogProduct } from '@/module/home/lib/home-catalog';

type ProductOtherCategoriesRailProps = {
  items: HomeCatalogProduct[];
  loading?: boolean;
  stackedBelowRail?: boolean;
};

export function ProductOtherCategoriesRail({
  items,
  loading,
  stackedBelowRail,
}: ProductOtherCategoriesRailProps) {
  return (
    <ProductPdpProductRail
      title="Explore other categories"
      subtitle="Popular packages from other setups"
      items={items}
      loading={loading}
      stackedBelowRail={stackedBelowRail}
    />
  );
}
