import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getApiError } from "@/api/api";
import { getProduct } from "@/api/products.api";
import { Button } from "@/components/ui/button";
import { ProductPdp, ProductPdpSkeleton } from "@/module/catalog/components/ProductPdp";
import { isBackendCityId, useLocationStore } from "@/store/location.store";

export function ProductPage() {
  const { id } = useParams();
  const city = useLocationStore((s) => s.city);
  const pincode = useLocationStore((s) => s.pincode);
  const setPickerOpen = useLocationStore((s) => s.setPickerOpen);

  const hasLocation =
    Boolean(pincode?.code) || (Boolean(city?.id) && isBackendCityId(city.id));

  const [status, setStatus] = useState(hasLocation ? "loading" : "need-location");
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (!id) {
      setStatus("error");
      setError("Product not found");
      setProduct(null);
      return undefined;
    }

    if (!hasLocation) {
      setStatus("need-location");
      setProduct(null);
      setError("");
      return undefined;
    }

    let cancelled = false;
    setStatus("loading");
    setError("");

    getProduct(id, {
      pincode: pincode?.code || undefined,
      cityId: pincode?.code ? undefined : city?.id,
    })
      .then((data) => {
        if (cancelled) return;
        setProduct(data);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setProduct(null);
        setError(getApiError(err));
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [id, hasLocation, pincode?.code, city?.id]);

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1240px] overflow-x-hidden px-4 py-6 md:px-8 md:py-10">
      {status === "need-location" ? (
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

      {status === "loading" ? <ProductPdpSkeleton /> : null}

      {status === "error" ? (
        <div className="flex flex-col items-start gap-4 rounded-4xl border bg-card p-6">
          <h1 className="font-heading text-2xl font-medium tracking-tight">
            Couldn’t load this setup
          </h1>
          <p className="max-w-[50ch] text-sm text-muted-foreground">{error}</p>
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

      {status === "ready" && product ? (
        <ProductPdp product={product} onChangeLocation={() => setPickerOpen(true)} />
      ) : null}
    </div>
  );
}
