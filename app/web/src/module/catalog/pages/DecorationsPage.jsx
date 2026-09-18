import { useMemo } from "react";
import { Link } from "react-router-dom";
import { CatalogProductGrid } from "@/module/catalog/components/CatalogProductGrid";
import { CategoryTileGrid } from "@/module/catalog/components/CategoryTileGrid";
import { normalizeCategoryTree } from "@/module/home/lib/home-catalog";
import { useCatalogStore } from "@/store/catalog.store";
import { useLocationStore } from "@/store/location.store";

export function DecorationsPage() {
  const city = useLocationStore((s) => s.city);
  const catalogStatus = useCatalogStore((s) => s.status);
  const rawCategories = useCatalogStore((s) => s.categories);

  const categories = useMemo(
    () => normalizeCategoryTree(rawCategories),
    [rawCategories],
  );
  const loadingCategories = catalogStatus === "loading" || catalogStatus === "idle";

  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 py-8 md:px-8 md:py-12">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          {" / "}
          Decorations
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
          All decorations
        </h1>
        <p className="mt-2 max-w-[60ch] text-sm text-muted-foreground">
          Browse setups priced for{" "}
          {city?.name ? (
            <span className="font-medium text-foreground">{city.name}</span>
          ) : (
            "your city"
          )}
          .
        </p>
      </div>

      {categories.length > 0 || loadingCategories ? (
        <section className="mb-10" aria-label="Categories">
          <h2 className="mb-4 font-heading text-lg font-semibold tracking-tight">
            Shop by occasion
          </h2>
          <CategoryTileGrid
            categories={categories}
            navigation="link"
            loading={loadingCategories}
          />
        </section>
      ) : null}

      <CatalogProductGrid sectionTitle="All packages" />
    </div>
  );
}
