import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DecoryImageFallback } from "@/components/decory-image-fallback";
import { DEMO_SLIDES } from "@/module/home/data/demo-banner";

const AUTOPLAY_MS = 6000;

function SlideImage({ src, alt }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) return <DecoryImageFallback />;
  return (
    <img
      src={src}
      alt={alt}
      className="absolute inset-0 size-full object-contain md:object-cover"
      onError={() => setBroken(true)}
    />
  );
}

export function BannerSlider({ slides = DEMO_SLIDES }) {
  const reduceMotion = useReducedMotion();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = slides.length;

  function go(next) {
    setCurrent((next + total) % total);
  }

  useEffect(() => {
    if (reduceMotion || paused || total < 2) return undefined;
    const id = window.setInterval(() => {
      setCurrent((index) => (index + 1) % total);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, reduceMotion, total, current]);

  return (
    <div
      className="relative h-[200px] overflow-hidden rounded-[22px] border border-border bg-black md:h-[420px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((item, index) => (
        <div
          key={item.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-[600ms] ease-in-out",
            index === current ? "z-10 opacity-100" : "z-0 opacity-0 pointer-events-none",
          )}
          aria-hidden={index !== current}
        >
          <SlideImage src={item.imageUrl} alt={item.alt} />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-transparent md:bg-linear-to-r md:from-black/92 md:via-black/55 md:to-transparent" />
          <div className="relative z-10 flex h-full max-w-[640px] flex-col justify-end px-4 pb-8 md:justify-center md:px-16 md:pb-0">
            <span className="mb-1.5 inline-flex w-fit items-center rounded-[14px] bg-primary px-2.5 py-1 text-[10px] font-semibold text-primary-foreground md:mb-[18px] md:px-[13px] md:py-1.5 md:text-xs">
              {item.tag}
            </span>
            <h1 className="font-heading text-[1.35rem] leading-[1.15] font-extrabold tracking-tight text-white md:text-[clamp(1.85rem,4.2vw,2.875rem)]">
              {item.title}
            </h1>
            <p className="mt-4 mb-6 hidden max-w-[460px] text-[15px] leading-[1.65] text-white/75 md:block">
              {item.subtitle}
            </p>
            <div className="mt-3 hidden flex-wrap items-center gap-4 md:mt-0 md:flex">
              <Button
                className="h-11 rounded-[22px] px-6 text-sm font-semibold"
                nativeButton={false}
                render={<Link to={item.href} />}
              >
                {item.ctaLabel}
              </Button>
              {item.secondaryLabel ? (
                <Button
                  variant="outline"
                  className="h-11 rounded-[22px] border-white/25 bg-transparent px-5 text-sm font-medium text-white hover:bg-white/10 hover:text-white"
                  nativeButton={false}
                  render={<Link to={item.secondaryHref ?? "/c/birthday"} />}
                >
                  {item.secondaryLabel}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ))}

      {total > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            className="absolute top-1/2 left-5 z-30 hidden size-[38px] -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white hover:bg-black/55 md:flex"
            onClick={() => go(current - 1)}
          >
            <ChevronLeftIcon className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            className="absolute top-1/2 right-5 z-30 hidden size-[38px] -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white hover:bg-black/55 md:flex"
            onClick={() => go(current + 1)}
          >
            <ChevronRightIcon className="size-4" />
          </button>
          <div className="absolute bottom-3 left-4 z-30 flex gap-2 md:bottom-7 md:left-16">
            {slides.map((item, index) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === current}
                className="h-[3px] w-[26px] overflow-hidden rounded-sm bg-white/20"
                onClick={() => go(index)}
              >
                <span
                  key={`${current}-${index}-${paused}`}
                  className={cn(
                    "block h-full origin-left bg-primary",
                    index < current && "scale-x-100",
                    index === current && !reduceMotion && !paused
                      ? "animate-[banner-fill_6s_linear_forwards]"
                      : index === current
                        ? "scale-x-100"
                        : "scale-x-0",
                  )}
                />
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
