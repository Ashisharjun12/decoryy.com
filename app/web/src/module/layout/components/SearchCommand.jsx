import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchIcon } from "lucide-react";
import { categoryPath, productPath } from "@/lib/catalog-path";
import { getLenis } from "@/lib/lenis-instance";
import {
  buildCategorySearchIndex,
  categoryIdsForSearchHits,
  filterCategorySearchHits,
  preferCategoryProductFilter,
} from "@/module/catalog/lib/search-category-suggestions";
import { normalizeCategoryTree } from "@/module/home/lib/home-catalog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Kbd } from "@/components/ui/kbd";
import {
  MIN_QUERY_LEN,
  useProductSearchQuery,
} from "@/module/catalog/hooks/use-product-search-query";
import { SearchProductRow } from "@/module/layout/components/SearchProductRow";
import { SearchProductRowSkeleton } from "@/module/layout/components/SearchProductRowSkeleton";
import { useCatalogStore } from "@/store/catalog.store";
import { isBackendCityId, useLocationStore } from "@/store/location.store";
import { useSearchDialogStore } from "@/store/search-dialog.store";

const MODAL_CATEGORY_LIMIT = 4;
const MODAL_CATEGORY_SEARCH_LIMIT = 5;
const MODAL_PRODUCT_LIMIT = 5;

function isMacPlatform() {
  if (typeof navigator === "undefined") return false;
  return /mac/i.test(navigator.userAgent);
}

function HighlightMatch({ text, query }) {
  const trimmed = query.trim();
  if (!trimmed) {
    return <span className="text-foreground">{text}</span>;
  }
  const lower = text.toLowerCase();
  const q = trimmed.toLowerCase();
  const index = lower.indexOf(q);
  if (index < 0) {
    return <span className="text-muted-foreground">{text}</span>;
  }
  return (
    <span className="text-muted-foreground">
      {text.slice(0, index)}
      <span className="font-semibold text-foreground">
        {text.slice(index, index + trimmed.length)}
      </span>
      {text.slice(index + trimmed.length)}
    </span>
  );
}

export function SearchCommand({ variant = "bar", className }) {
  const open = useSearchDialogStore((s) => s.open);
  const setOpen = useSearchDialogStore((s) => s.setOpen);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const rawCategories = useCatalogStore((s) => s.categories);
  const categories = useMemo(
    () => normalizeCategoryTree(rawCategories),
    [rawCategories],
  );
  const city = useLocationStore((s) => s.city);
  const pincode = useLocationStore((s) => s.pincode);
  const setPickerOpen = useLocationStore((s) => s.setPickerOpen);

  const hasLocation =
    Boolean(pincode?.code) || (city?.id && isBackendCityId(city.id));

  const categorySearchIndex = useMemo(
    () => buildCategorySearchIndex(categories),
    [categories],
  );

  const categorySuggestions = useMemo(() => {
    const limit = query.trim()
      ? MODAL_CATEGORY_SEARCH_LIMIT
      : MODAL_CATEGORY_LIMIT;
    return filterCategorySearchHits(categorySearchIndex, query, { limit });
  }, [categorySearchIndex, query]);

  const categoryHitsForProducts = useMemo(() => {
    if (query.trim().length < MIN_QUERY_LEN) return [];
    return filterCategorySearchHits(categorySearchIndex, query, {
      limit: MODAL_CATEGORY_SEARCH_LIMIT,
    });
  }, [categorySearchIndex, query]);

  const productCategoryIds = useMemo(() => {
    const ids = categoryIdsForSearchHits(categoryHitsForProducts);
    return ids.length > 0 ? ids : undefined;
  }, [categoryHitsForProducts]);

  const categoryScopedProductSearch = useMemo(
    () => preferCategoryProductFilter(categoryHitsForProducts, query),
    [categoryHitsForProducts, query],
  );

  const { data: products = [], isLoading, isFetching, isError } = useProductSearchQuery(
    query,
    {
      enabled: open,
      categoryIds: productCategoryIds,
      categoryScopedSearch: categoryScopedProductSearch,
    },
  );

  const visibleProducts = useMemo(
    () => products.slice(0, MODAL_PRODUCT_LIMIT),
    [products],
  );

  const productHeading =
    query.trim().length < MIN_QUERY_LEN ? "Popular setups" : "Results";
  const showSkeletons = (isLoading || isFetching) && products.length === 0;
  const showEmpty =
    !showSkeletons && !isLoading && products.length === 0 && hasLocation && !isError;

  const shortcut = isMacPlatform() ? "⌘K" : "Ctrl K";

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const lenis = getLenis();
    lenis?.stop();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      lenis?.start();
    };
  }, [open]);

  useEffect(() => {
    if (variant !== "bar") return undefined;
    function onKey(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [variant]);

  function goToProduct(product) {
    setOpen(false);
    navigate(productPath(product));
  }

  const dialog = (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Search"
      description="Search decorations and occasions"
      className="top-[12vh] max-w-[min(100%-1.25rem,36rem)] translate-y-0 sm:max-w-[36rem]"
    >
      <Command
        shouldFilter={false}
        className="flex max-h-[min(32rem,78vh)] flex-col overflow-hidden rounded-3xl bg-card p-0 shadow-none"
      >
        <CommandInput
          iconPosition="start"
          placeholder="Search setups, occasions, subcategories…"
          value={query}
          onValueChange={setQuery}
          wrapperClassName="shrink-0 px-3 pt-3 pb-2"
          inputGroupClassName="h-11 rounded-2xl border border-border/60 bg-muted/40 px-1"
        />
        <CommandList
          className="min-h-0 max-h-none flex-1 overflow-y-auto overscroll-contain px-2 pb-3"
          data-lenis-prevent
        >
          {!hasLocation ? (
            <div className="px-2 py-10 text-center">
              <p className="text-sm font-medium text-foreground">Pick your city</p>
              <p className="mt-1 text-sm text-muted-foreground">
                We need a serviceable city to search local setups.
              </p>
              <Button
                type="button"
                className="mt-4 rounded-lg"
                onClick={() => {
                  setOpen(false);
                  setPickerOpen(true);
                }}
              >
                Select city
              </Button>
            </div>
          ) : (
            <>
              {categorySuggestions.length > 0 ? (
                <div className="pb-1">
                  <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    {query.trim() ? "Categories" : "Suggestions"}
                  </p>
                  <CommandGroup className="p-0">
                    {categorySuggestions.map((hit) => (
                      <CommandItem
                        key={hit.id}
                        value={`category ${hit.parent.slug} ${hit.child?.slug ?? ""} ${hit.label}`}
                        className="gap-3 rounded-xl px-2 py-2.5 aria-selected:bg-muted/80 [&_svg:last-child]:hidden"
                        onSelect={() => {
                          setOpen(false);
                          navigate(categoryPath(hit.parent, hit.child));
                        }}
                      >
                        <SearchIcon
                          className="size-4 shrink-0 text-muted-foreground/70"
                          aria-hidden
                        />
                        <span className="min-w-0 flex-1 text-left text-sm">
                          <span className="block truncate">
                            <HighlightMatch text={hit.label} query={query} />
                          </span>
                          {hit.child ? (
                            <span className="block truncate text-xs text-muted-foreground">
                              in {hit.parent.name}
                            </span>
                          ) : null}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </div>
              ) : null}

              <div
                className={cn(
                  "border-border/50 pt-1",
                  categorySuggestions.length > 0 && "mt-1 border-t",
                )}
              >
                <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  {productHeading}
                </p>
                {showSkeletons ? (
                  <div className="pb-1">
                    {Array.from({ length: MODAL_PRODUCT_LIMIT }).map((_, i) => (
                      <SearchProductRowSkeleton key={i} />
                    ))}
                  </div>
                ) : null}
                {visibleProducts.length > 0 ? (
                  <CommandGroup className="p-0">
                    {visibleProducts.map((product) => (
                      <SearchProductRow
                        key={product.id}
                        product={product}
                        onSelect={() => goToProduct(product)}
                      />
                    ))}
                  </CommandGroup>
                ) : null}
                {showEmpty ? (
                  <CommandEmpty className="py-8 text-muted-foreground">
                    No setups found.
                  </CommandEmpty>
                ) : null}
                {isError ? (
                  <p className="px-2 py-6 text-center text-sm text-destructive">
                    Could not load products. Try again.
                  </p>
                ) : null}
              </div>
            </>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );

  if (variant === "pill") {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "flex h-11 w-full items-center gap-2.5 rounded-full bg-background px-4 text-left text-[13px] text-muted-foreground shadow-sm",
            className,
          )}
        >
          <SearchIcon className="size-4 shrink-0 text-amber-700" />
          <span className="min-w-0 flex-1 truncate">
            Search decorations, occasions…
          </span>
        </button>
        {dialog}
      </>
    );
  }

  if (variant === "icon" || variant === "toolbarIcon") {
    return (
      <>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "size-9 shrink-0",
            variant === "icon" && "md:hidden",
            className,
          )}
          onClick={() => setOpen(true)}
        >
          <SearchIcon className="size-5" />
          <span className="sr-only">Search</span>
        </Button>
        {dialog}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-10 w-full items-center gap-2.5 rounded-full border border-border bg-card px-4 text-left text-[13.5px] text-muted-foreground transition-shadow hover:shadow-sm",
          className,
        )}
      >
        <SearchIcon className="size-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate">Search decorations, occasions…</span>
        <Kbd className="hidden sm:inline-flex">{shortcut}</Kbd>
      </button>
      {dialog}
    </>
  );
}
