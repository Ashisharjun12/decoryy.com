import { useCallback, useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import {
  HomeProductCardRail,
  HomeProductCardRailSkeleton,
} from "@/module/home/components/HomeProductCard";
import { HomeScrollControls } from "@/module/home/components/HomeScrollControls";
import { HomeSectionHeading } from "@/module/home/components/HomeSectionHeading";
import {
  PRODUCT_RAIL_ITEM_CLASS,
  PRODUCT_RAIL_MIN_ITEMS_FOR_CONTROLS,
} from "@/module/home/lib/product-rail-layout";

export function HomeProductRail({
  section,
  loading = false,
  title: titleOverride,
  subtitle,
  showTitle = true,
  showSubtitle = true,
}) {
  const railTitle = titleOverride ?? section.name;
  const itemCount = section.items?.length ?? 0;
  const showScrollControls =
    !loading && itemCount >= PRODUCT_RAIL_MIN_ITEMS_FOR_CONTROLS;
  const [api, setApi] = useState(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const onSelect = useCallback((carouselApi) => {
    if (!carouselApi) return;
    setCanPrev(carouselApi.canScrollPrev());
    setCanNext(carouselApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!api) return undefined;
    onSelect(api);
    api.on("reInit", onSelect);
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  return (
    <section aria-label={railTitle}>
      <div
        className={cn(
          "mb-3 gap-x-2 gap-y-1",
          showScrollControls
            ? "grid grid-cols-[minmax(0,1fr)_auto] items-start"
            : "flex flex-col",
        )}
      >
        {showTitle || (showSubtitle && subtitle) ? (
          <HomeSectionHeading
            title={showTitle ? railTitle : " "}
            subtitle={showSubtitle ? subtitle : null}
            compact
            hideSubtitle={false}
          />
        ) : (
          <span />
        )}
        {showScrollControls ? (
          <HomeScrollControls
            className="shrink-0 pt-0.5"
            canPrev={canPrev}
            canNext={canNext}
            onPrev={() => api?.scrollPrev()}
            onNext={() => api?.scrollNext()}
          />
        ) : null}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <HomeProductCardRailSkeleton key={index} />
          ))}
        </div>
      ) : (
        <Carousel
          setApi={setApi}
          opts={{ align: "start", dragFree: true }}
          className="w-full"
        >
          <CarouselContent className="-ml-2.5">
            {section.items.map((product) => (
              <CarouselItem
                key={product.id}
                className={cn(PRODUCT_RAIL_ITEM_CLASS, "pl-2.5")}
              >
                <HomeProductCardRail
                  product={product}
                  badgeLabel={section.badgeLabel ?? section.name}
                  badgeColor={section.badgeColor}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      )}
    </section>
  );
}
