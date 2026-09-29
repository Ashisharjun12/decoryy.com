import { useCallback, useEffect, useState } from "react";
import { listProducts } from "@/api/products.api";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { isBackendCityId, useLocationStore } from "@/store/location.store";
import {
  HomeProductCardRail,
  HomeProductCardRailSkeleton,
} from "@/module/home/components/HomeProductCard";
import { HomeScrollControls } from "@/module/home/components/HomeScrollControls";
import { HomeSectionHeading } from "@/module/home/components/HomeSectionHeading";
import { normalizeProduct } from "@/module/home/lib/home-catalog";
import {
  PRODUCT_RAIL_PDP_MIN_CONTROLS,
  PRODUCT_RAIL_PDP_SIMILAR_ITEM_CLASS,
} from "@/module/home/lib/product-rail-layout";

const SIMILAR_PAGE_SIZE = 20;
const OTHER_CATEGORY_FETCH_LIMIT = 48;
const OTHER_CATEGORY_MAX_ITEMS = 20;

const RAIL_COPY = {
  "same-category": {
    ariaLabel: "You may also like",
    title: "You may also like",
    subtitle: "Explore more décor in this category",
    sectionClass: "mt-12 border-t border-border/60 pt-10 md:mt-16 md:pt-12",
  },
  "other-categories": {
    ariaLabel: "Explore other categories",
    title: "Explore other categories",
    subtitle: "Popular packages from other setups",
    sectionClass: "mt-6 border-t border-border/60 pt-6 md:mt-8 md:pt-7",
  },
};

function filterRows(raw, product, variant) {
  return raw.filter((row) => {
    if (row.id === product.id) return false;
    if (variant === "other-categories" && row.categoryId === product.categoryId) {
      return false;
    }
    return true;
  });
}

export function ProductPdpProductRail({ product, variant = "same-category" }) {
  const copy = RAIL_COPY[variant] ?? RAIL_COPY["same-category"];
  const city = useLocationStore((s) => s.city);
  const pincode = useLocationStore((s) => s.pincode);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [carouselApi, setCarouselApi] = useState(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const serviceCityId = isBackendCityId(city?.id) ? city.id : undefined;
  const pincodeCode = pincode?.code || undefined;
  const hasLocation = Boolean(serviceCityId || pincodeCode);
  const enablePagination = variant === "same-category";

  const onCarouselSelect = useCallback((api) => {
    if (!api) return;
    setCanPrev(api.canScrollPrev());
    setCanNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!carouselApi) return undefined;
    onCarouselSelect(carouselApi);
    carouselApi.on("reInit", onCarouselSelect);
    carouselApi.on("select", onCarouselSelect);
    return () => {
      carouselApi.off("reInit", onCarouselSelect);
      carouselApi.off("select", onCarouselSelect);
    };
  }, [carouselApi, onCarouselSelect, items.length]);

  async function fetchPage(pageNum, append) {
    if (!product?.categoryId || !product?.id) return;
    const limit =
      variant === "other-categories" ? OTHER_CATEGORY_FETCH_LIMIT : SIMILAR_PAGE_SIZE;
    const data = await listProducts({
      ...(variant === "same-category"
        ? { categoryIds: [product.categoryId] }
        : { sort: "popularity" }),
      cityId: pincodeCode ? undefined : serviceCityId,
      pincode: pincodeCode,
      page: pageNum,
      limit,
    });
    const raw = data?.items ?? [];
    let filtered = filterRows(raw, product, variant);
    if (variant === "other-categories" && !append) {
      filtered = filtered.slice(0, OTHER_CATEGORY_MAX_ITEMS);
    }
    const rows = filtered.map(normalizeProduct).filter(Boolean);
    const nextTotal = Number(data?.total ?? 0);
    if (enablePagination) {
      setHasMore(pageNum * SIMILAR_PAGE_SIZE < nextTotal);
    } else {
      setHasMore(false);
    }
    setItems((prev) => {
      if (!append) return rows;
      const seen = new Set(prev.map((item) => item.id));
      const merged = [...prev];
      for (const row of rows) {
        if (!seen.has(row.id)) merged.push(row);
      }
      return merged;
    });
  }

  useEffect(() => {
    if (!product?.id || !product?.categoryId || !hasLocation) {
      setItems([]);
      setHasMore(false);
      setPage(1);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setPage(1);

    void fetchPage(1, false)
      .catch(() => {
        if (!cancelled) {
          setItems([]);
          setHasMore(false);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [product?.categoryId, product?.id, city?.id, pincode?.code, hasLocation, variant]);

  async function onViewMore() {
    if (loadingMore || !hasMore || !enablePagination) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      await fetchPage(nextPage, true);
      setPage(nextPage);
      requestAnimationFrame(() => carouselApi?.reInit());
    } catch {
      // keep current items
    } finally {
      setLoadingMore(false);
    }
  }

  if (!loading && items.length === 0) return null;

  const showScrollControls =
    !loading && items.length >= PRODUCT_RAIL_PDP_MIN_CONTROLS;

  return (
    <section className={copy.sectionClass} aria-label={copy.ariaLabel}>
      <div
        className={cn(
          "mb-3 gap-x-2 gap-y-1",
          showScrollControls
            ? "grid grid-cols-[minmax(0,1fr)_auto] items-start"
            : "flex flex-col",
        )}
      >
        <HomeSectionHeading title={copy.title} subtitle={copy.subtitle} compact />
        {showScrollControls ? (
          <HomeScrollControls
            className="shrink-0 pt-0.5"
            canPrev={canPrev}
            canNext={canNext}
            onPrev={() => carouselApi?.scrollPrev()}
            onNext={() => carouselApi?.scrollNext()}
          />
        ) : null}
      </div>

      {loading ? (
        <div className="flex gap-2.5 overflow-hidden">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className={cn(PRODUCT_RAIL_PDP_SIMILAR_ITEM_CLASS, "min-w-0 shrink-0")}
            >
              <HomeProductCardRailSkeleton />
            </div>
          ))}
        </div>
      ) : (
        <>
          <Carousel
            setApi={setCarouselApi}
            opts={{ align: "start", dragFree: true }}
            className="w-full"
          >
            <CarouselContent className="-ml-2">
              {items.map((item) => (
                <CarouselItem
                  key={item.id}
                  className={cn(PRODUCT_RAIL_PDP_SIMILAR_ITEM_CLASS, "h-auto pl-2")}
                >
                  <HomeProductCardRail product={item} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          {hasMore && enablePagination ? (
            <div className="mt-6 flex justify-center">
              <Button
                type="button"
                size="lg"
                className="min-w-[10.5rem] rounded-full bg-primary text-black hover:bg-primary/85"
                disabled={loadingMore}
                onClick={() => void onViewMore()}
              >
                {loadingMore ? "Loading…" : "View more"}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
