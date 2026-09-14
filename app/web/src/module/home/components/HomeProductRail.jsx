import { useCallback, useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { HomeProductCardCompact, HomeProductCardSkeleton } from "@/module/home/components/HomeProductCard";
import { HomeScrollControls } from "@/module/home/components/HomeScrollControls";
import { HomeSectionHeading } from "@/module/home/components/HomeSectionHeading";

export function HomeProductRail({ section, loading = false }) {
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
    <section aria-label={section.name}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <HomeSectionHeading title={section.name} />
        <HomeScrollControls
          canPrev={canPrev}
          canNext={canNext}
          onPrev={() => api?.scrollPrev()}
          onNext={() => api?.scrollNext()}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <HomeProductCardSkeleton key={index} compact />
          ))}
        </div>
      ) : (
        <Carousel
          setApi={setApi}
          opts={{ align: "start", dragFree: true }}
          className="w-full"
        >
          <CarouselContent className="-ml-3">
            {section.items.map((product) => (
              <CarouselItem
                key={product.id}
                className="basis-1/2 pl-3 sm:basis-1/3 lg:basis-1/4"
              >
                <HomeProductCardCompact product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      )}
    </section>
  );
}
