import { useEffect, useMemo, useState } from "react";
import { ChevronLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { HomeCategoryTile } from "@/module/home/components/HomeCategoryTile";
import { HomeSectionHeading } from "@/module/home/components/HomeSectionHeading";

function CategorySkeletonRow() {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6 lg:gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex min-w-0 flex-col items-center gap-2.5">
          <Skeleton className="aspect-square w-full rounded-[22px]" />
          <Skeleton className="h-3 w-16 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function HomeCategoryExplorer({ categories = [], loading = false }) {
  const [stack, setStack] = useState([]);

  useEffect(() => {
    setStack([]);
  }, [categories]);

  const currentParent = stack[stack.length - 1] ?? null;
  const visibleCategories = useMemo(() => {
    if (currentParent) return currentParent.children ?? [];
    return categories;
  }, [categories, currentParent]);

  const title = currentParent?.name ?? "Top decoration categories";
  const subtitle = currentParent
    ? `Pick a ${currentParent.name.toLowerCase()} setup`
    : "Trusted decorators for all events";

  return (
    <section aria-label="Decoration categories">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2">
          {currentParent ? (
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="mt-0.5 shrink-0 rounded-full"
              onClick={() => setStack((prev) => prev.slice(0, -1))}
              aria-label="Back to categories"
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
          ) : null}
          <HomeSectionHeading title={title} subtitle={subtitle} />
        </div>
      </div>

      {loading ? (
        <CategorySkeletonRow />
      ) : (
        <div
          className={cn(
            "pb-1",
            currentParent
              ? "flex gap-3 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              : "grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6 lg:gap-4",
          )}
        >
          {visibleCategories.map((category) => (
            <HomeCategoryTile
              key={category.id}
              category={category}
              parent={currentParent}
              onDrill={(next) => setStack((prev) => [...prev, next])}
              className={currentParent ? "w-[100px] shrink-0 sm:w-[110px]" : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}
