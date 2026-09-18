import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HomeCategoryTile } from "@/module/home/components/HomeCategoryTile";

export const CATEGORY_TILE_COLS = 5;
export const HOME_CATEGORY_PREVIEW_COUNT = 5;
export const CATEGORY_TILE_INITIAL_COUNT = CATEGORY_TILE_COLS * 2;
export const CATEGORY_TILE_EXPAND_STEP = 20;

export const categoryRowClassHome =
  "grid grid-cols-5 gap-2.5 sm:gap-3";

export const categoryRowClassCatalog =
  "grid grid-cols-5 gap-2.5 sm:grid-cols-6 sm:gap-3 md:gap-3.5";

export const categoryTileWrapClass = "min-w-0 w-full";

function rowClassForLayout(layout) {
  return layout === "home" ? categoryRowClassHome : categoryRowClassCatalog;
}

export function CategoryTileGridSkeleton({
  count = CATEGORY_TILE_INITIAL_COUNT,
  layout = "catalog",
}) {
  const skeletonImageClass =
    "aspect-square w-full rounded-2xl bg-muted/30";
  return (
    <div className={rowClassForLayout(layout)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "flex min-w-0 flex-col items-center gap-2",
            categoryTileWrapClass,
          )}
        >
          <Skeleton className={skeletonImageClass} />
          <Skeleton className="h-3 w-16 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function CategoryTileGrid({
  categories = [],
  parent = null,
  navigation = "drill",
  onDrill,
  loading = false,
  initialVisible = CATEGORY_TILE_INITIAL_COUNT,
  expandStep = CATEGORY_TILE_EXPAND_STEP,
  showExpandButton = true,
  skeletonCount,
  layout = "catalog",
}) {
  const [visibleCount, setVisibleCount] = useState(initialVisible);
  const categoryKey = useMemo(
    () => categories.map((c) => c.id).join(","),
    [categories],
  );

  useEffect(() => {
    setVisibleCount(initialVisible);
  }, [categoryKey, initialVisible]);

  if (loading) {
    return (
      <CategoryTileGridSkeleton
        count={skeletonCount ?? initialVisible}
        layout={layout}
      />
    );
  }

  const visible = categories.slice(0, visibleCount);
  const hasMore = showExpandButton && categories.length > visibleCount;
  const rowClass = rowClassForLayout(layout);

  return (
    <div className="flex flex-col gap-4">
      <div className={rowClass}>
        {visible.map((category) => (
          <HomeCategoryTile
            key={category.id}
            category={category}
            parent={parent}
            navigation={navigation}
            onDrill={onDrill}
            className={categoryTileWrapClass}
          />
        ))}
      </div>
      {hasMore ? (
        <div className="flex justify-center pt-1">
          <Button
            type="button"
            variant="ghost"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
            onClick={() =>
              setVisibleCount((count) =>
                Math.min(count + expandStep, categories.length),
              )
            }
          >
            View all
          </Button>
        </div>
      ) : null}
    </div>
  );
}
