import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRightIcon } from "lucide-react";
import { getApiError } from "@/api/api";
import { listProducts } from "@/api/products.api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CatalogPagination } from "@/module/catalog/components/CatalogPagination";
import { HomeProductCard, HomeProductCardSkeleton } from "@/module/home/components/HomeProductCard";
import { isBackendCityId, useLocationStore } from "@/store/location.store";

const LIMIT = 24;

export function DecorationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const city = useLocationStore((s) => s.city);
  const pincode = useLocationStore((s) => s.pincode);
  const setPickerOpen = useLocationStore((s) => s.setPickerOpen);

  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const hasLocation =
    Boolean(pincode?.code) || (Boolean(city?.id) && isBackendCityId(city.id));

  const [status, setStatus] = useState(hasLocation ? "loading" : "need-location");
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  const setPage = useCallback(
    (nextPage) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (nextPage <= 1) next.delete("page");
          else next.set("page", String(nextPage));
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  useEffect(() => {
    if (!hasLocation) {
      setStatus("need-location");
      setItems([]);
      setTotal(0);
      return undefined;
    }

    let cancelled = false;
    setStatus("loading");
    setError("");

    void listProducts({
      pincode: pincode?.code || undefined,
      cityId: pincode?.code ? undefined : city?.id,
      page,
      limit: LIMIT,
    })
      .then((data) => {
        if (cancelled) return;
        setItems(Array.isArray(data?.items) ? data.items : []);
        setTotal(Number(data?.total ?? 0));
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(getApiError(err));
        setItems([]);
        setTotal(0);
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [hasLocation, pincode?.code, city?.id, page]);

  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 py-8 md:px-8 md:py-12">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          {" / "}
          Decorations
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
          All decorations
        </h1>
        <p className="mt-2 max-w-[60ch] text-sm text-muted-foreground">
          Browse setups priced for{" "}
          {city?.name ? (
            <span className="font-medium text-foreground">{city.name}</span>
          ) : (
            "your city"
          )}
          .
        </p>
      </div>

      {status === "need-location" ? (
        <div className="rounded-3xl border border-dashed border-border px-6 py-16 text-center">
          <p className="font-heading text-lg font-semibold">Pick your city</p>
          <p className="mt-2 text-sm text-muted-foreground">
            We need a serviceable city to show local prices.
          </p>
          <Button
            className="mt-5 rounded-full"
            onClick={() => setPickerOpen(true)}
          >
            Select city
            <ArrowRightIcon className="size-4" />
          </Button>
        </div>
      ) : null}

      {status === "loading" ? (
        <div className="space-y-6" aria-busy="true" aria-live="polite">
          <span className="sr-only">Loading decorations</span>
          <Skeleton className="h-4 w-40 rounded-md" />
          <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <HomeProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      ) : null}

      {status === "error" ? (
        <div className="rounded-3xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center">
          <p className="font-medium text-destructive">
            {error || "Could not load products"}
          </p>
        </div>
      ) : null}

      {status === "ready" && items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border px-6 py-16 text-center">
          <p className="font-heading text-lg font-semibold">No setups yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Check back soon or try another city.
          </p>
        </div>
      ) : null}

      {status === "ready" && items.length > 0 ? (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)}
            </span>{" "}
            of {total}
          </p>
          <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
            {items.map((product) => (
              <HomeProductCard key={product.id} product={product} />
            ))}
          </div>
          <CatalogPagination
            page={page}
            limit={LIMIT}
            total={total}
            onPageChange={setPage}
          />
        </div>
      ) : null}
    </div>
  );
}
