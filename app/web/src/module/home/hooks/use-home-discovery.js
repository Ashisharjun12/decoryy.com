import { useEffect, useMemo, useState } from "react";
import { listProducts } from "@/api/products.api";
import { listSections } from "@/api/sections.api";
import {
  normalizeApiSections,
  normalizeCategoryTree,
  normalizeProduct,
} from "@/module/home/lib/home-catalog";
import { isBackendCityId, useLocationStore } from "@/store/location.store";
import { useCatalogStore } from "@/store/catalog.store";

export function useHomeDiscovery() {
  const cityId = useLocationStore((s) => s.city?.id);
  const pincode = useLocationStore((s) => s.pincode);
  const locationStatus = useLocationStore((s) => s.status);

  const [sectionsStatus, setSectionsStatus] = useState("loading");
  const [apiSections, setApiSections] = useState([]);

  useEffect(() => {
    if (locationStatus !== "ready") {
      setSectionsStatus("loading");
      return;
    }

    const serviceCityId = isBackendCityId(cityId) ? cityId : undefined;
    const pincodeCode = pincode?.code ?? null;

    if (!serviceCityId && !pincodeCode) {
      setApiSections([]);
      setSectionsStatus("ready");
      return;
    }

    let cancelled = false;
    setSectionsStatus("loading");

    const locationQuery = {
      cityId: serviceCityId,
      pincode: pincodeCode ?? undefined,
    };

    listSections(locationQuery)
      .then(async (data) => {
        if (cancelled) return;
        const fromSections = normalizeApiSections(data);
        if (fromSections.length > 0) {
          setApiSections(fromSections);
          setSectionsStatus("ready");
          return;
        }

        const catalog = await listProducts({ ...locationQuery, page: 1, limit: 16 });
        if (cancelled) return;
        const items = (catalog?.items ?? [])
          .map(normalizeProduct)
          .filter(Boolean);
        if (items.length === 0) {
          setApiSections([]);
        } else {
          setApiSections([
            {
              id: "catalog-fallback",
              slug: "decorations",
              name: "Popular setups",
              sortIndex: 0,
              items,
            },
          ]);
        }
        setSectionsStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setApiSections([]);
        setSectionsStatus("ready");
      });

    return () => {
      cancelled = true;
    };
  }, [cityId, pincode, locationStatus]);

  const catalogCategories = useCatalogStore((s) => s.categories);

  const categories = useMemo(
    () => normalizeCategoryTree(catalogCategories),
    [catalogCategories],
  );

  const sections = apiSections;

  const loading =
    locationStatus !== "ready" || sectionsStatus === "loading";

  return {
    categories,
    sections,
    loading,
  };
}
