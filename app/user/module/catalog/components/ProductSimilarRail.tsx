import { ProductPdpProductRail } from '@/module/catalog/components/ProductPdpProductRail';
import type { HomeCatalogProduct } from '@/module/home/lib/home-catalog';

type ProductSimilarRailProps = {
  items: HomeCatalogProduct[];
  loading?: boolean;
};

export function ProductSimilarRail({ items, loading }: ProductSimilarRailProps) {
  return (
    <ProductPdpProductRail
      title="You may also like"
      subtitle="Explore more décor in this category"
      items={items}
      loading={loading}
    />
  );
}
