import { useState } from "react";
import { Link } from "react-router-dom";
import { categoryPath } from "@/lib/catalog-path";
import { resolveCategoryIcon } from "@/lib/category-icons";
import { cn } from "@/lib/utils";
import { DecoryImageFallback } from "@/components/decory-image-fallback";

export function HomeCategoryTile({ category, parent, onDrill, className }) {
  const [broken, setBroken] = useState(false);
  const hasChildren = category.children?.length > 0;
  const { Icon, iconBg } = resolveCategoryIcon({
    iconKey: category.iconKey,
    iconTone: category.iconTone,
    slug: category.slug,
  });
  const imageUrl = category.imageUrl;
  const label = category.name;
  const tileBg = category.tileBg ?? "bg-amber-50";

  const tileClass = cn(
    "group flex min-w-0 flex-col items-center gap-2.5",
    className,
  );

  const imageBox = (
    <span
      className={cn(
        "flex aspect-square w-full items-center justify-center overflow-hidden rounded-[22px] p-3 transition-shadow group-hover:shadow-md dark:bg-amber-950/20",
        tileBg,
        !imageUrl && iconBg,
      )}
    >
      {imageUrl && !broken ? (
        <img
          src={imageUrl}
          alt=""
          className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-[1.03]"
          onError={() => setBroken(true)}
        />
      ) : imageUrl && broken ? (
        <DecoryImageFallback />
      ) : (
        <Icon className="size-9" strokeWidth={1.75} />
      )}
    </span>
  );

  const labelEl = (
    <span className="line-clamp-2 w-full text-center text-[13px] font-semibold leading-snug text-foreground">
      {label}
    </span>
  );

  if (hasChildren) {
    return (
      <button type="button" onClick={() => onDrill?.(category)} className={tileClass}>
        {imageBox}
        {labelEl}
      </button>
    );
  }

  const href = parent ? categoryPath(parent, category) : categoryPath(category);

  return (
    <Link to={href} className={tileClass}>
      {imageBox}
      {labelEl}
    </Link>
  );
}
