import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DecoryImageFallback } from "@/components/decory-image-fallback";
import { hasBannerOverlay } from "@/module/cms/lib/banner-slide";

export function HomePromoBanner({ slide, className = "" }) {
  if (!slide) return null;

  const imageOnly = !hasBannerOverlay(slide);

  if (imageOnly) {
    const image = slide.imageUrl ? (
      <img
        src={slide.imageUrl}
        alt={slide.alt ?? "Banner"}
        className="block w-full object-cover"
      />
    ) : (
      <DecoryImageFallback className="min-h-[180px] w-full md:min-h-[220px]" />
    );

    return (
      <section className={`mx-auto max-w-[1240px] px-4 md:px-8 ${className}`}>
        <div className="overflow-hidden rounded-[22px] border border-border">
          {slide.href ? (
            <Link to={slide.href} className="block" aria-label={slide.alt ?? "Banner"}>
              {image}
            </Link>
          ) : (
            image
          )}
        </div>
      </section>
    );
  }

  return (
    <section className={`mx-auto max-w-[1240px] px-4 md:px-8 ${className}`}>
      <div className="relative overflow-hidden rounded-[22px] border border-border bg-black">
        {slide.imageUrl ? (
          <img src={slide.imageUrl} alt={slide.alt ?? ""} className="absolute inset-0 size-full object-cover opacity-60" />
        ) : (
          <DecoryImageFallback className="absolute inset-0 size-full" />
        )}
        <div className="relative z-10 flex min-h-[180px] flex-col justify-end gap-3 p-6 md:min-h-[220px] md:p-10">
          {slide.tag ? (
            <span className="inline-flex w-fit rounded-[14px] bg-white/15 px-2.5 py-1 text-[10px] font-semibold text-white md:text-xs">
              {slide.tag}
            </span>
          ) : null}
          {slide.title ? (
            <h2 className="font-heading max-w-xl text-2xl font-extrabold tracking-tight text-white md:text-3xl">
              {slide.title}
            </h2>
          ) : null}
          {slide.subtitle ? (
            <p className="max-w-xl text-sm text-white/75 md:text-base">{slide.subtitle}</p>
          ) : null}
          {slide.ctaLabel ? (
            <Button
              className="mt-2 w-fit rounded-[22px]"
              nativeButton={false}
              render={<Link to={slide.href ?? "/decorations"} />}
            >
              {slide.ctaLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
