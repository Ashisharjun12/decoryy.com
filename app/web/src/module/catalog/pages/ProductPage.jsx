import { Link, useParams } from "react-router-dom";
import { getApiError } from "@/api/api";
import { Button } from "@/components/ui/button";
import { ProductPdp, ProductPdpSkeleton } from "@/module/catalog/components/ProductPdp";
import {
  useProductDetailLocation,
  useProductDetailQuery,
} from "@/module/catalog/hooks/use-product-detail-query";
import { useLocationStore } from "@/store/location.store";

export function ProductPage() {
  const { id } = useParams();
  const setPickerOpen = useLocationStore((s) => s.setPickerOpen);
  const { hasLocation } = useProductDetailLocation();

  const { data: product, isLoading, isError, error } = useProductDetailQuery(id, {
    enabled: hasLocation,
  });

  if (!id) {
    return (
      <div className="mx-auto w-full min-w-0 max-w-[1240px] overflow-x-hidden px-4 py-6 md:px-8 md:py-10">
        <div className="flex flex-col items-start gap-4 rounded-4xl border bg-card p-6">
          <h1 className="font-heading text-2xl font-medium tracking-tight">Product not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1240px] overflow-x-hidden px-4 py-6 md:px-8 md:py-10">
      {!hasLocation ? (
        <div className="flex flex-col items-start gap-4 rounded-4xl border bg-card p-6">
          <h1 className="font-heading text-2xl font-medium tracking-tight">
            Choose your city
          </h1>
          <p className="max-w-[50ch] text-sm text-muted-foreground">
            Product pricing and availability depend on your location. Select a city to continue.
          </p>
          <Button type="button" onClick={() => setPickerOpen(true)}>
            Select city
          </Button>
        </div>
      ) : null}

      {hasLocation && isLoading ? <ProductPdpSkeleton /> : null}

      {hasLocation && isError ? (
        <div className="flex flex-col items-start gap-4 rounded-4xl border bg-card p-6">
          <h1 className="font-heading text-2xl font-medium tracking-tight">
            Couldn’t load this setup
          </h1>
          <p className="max-w-[50ch] text-sm text-muted-foreground">{getApiError(error)}</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => setPickerOpen(true)}>
              Change city
            </Button>
            <Button type="button" nativeButton={false} render={<Link to="/decorations" />}>
              Browse decorations
            </Button>
          </div>
        </div>
      ) : null}

      {hasLocation && product ? (
        <ProductPdp product={product} onChangeLocation={() => setPickerOpen(true)} />
      ) : null}
    </div>
  );
}
