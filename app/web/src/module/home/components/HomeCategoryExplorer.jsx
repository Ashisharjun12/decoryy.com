import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeftIcon } from "lucide-react";
import { categoryPath } from "@/lib/catalog-path";
import { Button } from "@/components/ui/button";
import {
  CategoryTileGrid,
  HOME_CATEGORY_PREVIEW_COUNT,
} from "@/module/catalog/components/CategoryTileGrid";
import { HomeSectionHeading } from "@/module/home/components/HomeSectionHeading";

export function HomeCategoryExplorer({
  categories = [],
  loading = false,
  headingTitle,
  headingSubtitle,
  showTitle = true,
  showSubtitle = true,
  maxVisible = HOME_CATEGORY_PREVIEW_COUNT,
  showViewAll = true,
  viewAllHref: viewAllHrefProp,
  enableDrillDown = true,
}) {
  const [stack, setStack] = useState([]);

  useEffect(() => {
    setStack([]);
  }, [categories]);

  const currentParent = stack[stack.length - 1] ?? null;
  const visibleCategories = useMemo(() => {
    if (currentParent) return currentParent.children ?? [];
    return categories;
  }, [categories, currentParent]);

  const title = currentParent?.name ?? headingTitle ?? "Top balloon decoration categories";
  const subtitle = currentParent
    ? `Pick a ${currentParent.name.toLowerCase()} setup`
    : headingSubtitle ?? "Trusted decorators for all events";

  const showViewAllLink =
    showViewAll &&
    visibleCategories.length > maxVisible &&
    !loading;
  const viewAllHref = currentParent
    ? categoryPath(currentParent)
    : viewAllHrefProp ?? "/decorations";

  return (
    <section aria-label="Decoration categories">
      <div className="mb-4">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-2 gap-y-1.5">
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
            {showTitle ? (
              <HomeSectionHeading
                className="min-w-0 flex-1"
                title={title}
                subtitle={showSubtitle ? subtitle : null}
                compact
                hideSubtitle
              />
            ) : null}
          </div>
          {showViewAllLink && !loading ? (
            <Link
              to={viewAllHref}
              className="shrink-0 self-center whitespace-nowrap pt-0.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
            >
              View all →
            </Link>
          ) : null}
          {showSubtitle && subtitle ? (
            <p className="col-span-2 max-w-[460px] text-xs text-muted-foreground sm:text-[13px]">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>

      <CategoryTileGrid
        categories={visibleCategories}
        parent={currentParent}
        navigation={enableDrillDown ? "drill" : "link"}
        onDrill={enableDrillDown ? (next) => setStack((prev) => [...prev, next]) : undefined}
        loading={loading}
        initialVisible={maxVisible}
        showExpandButton={false}
        skeletonCount={HOME_CATEGORY_PREVIEW_COUNT}
        layout="home"
      />
    </section>
  );
}
