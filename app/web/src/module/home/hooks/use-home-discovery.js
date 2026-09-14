import { useEffect, useMemo, useState } from "react";
import { listSections } from "@/api/sections.api";
import {
  buildDemoSections,
  getDemoCategories,
  normalizeApiSections,
} from "@/module/home/lib/home-catalog";
import { useLocationStore } from "@/store/location.store";

export function useHomeDiscovery() {
  const cityId = useLocationStore((s) => s.city?.id);
  const pincode = useLocationStore((s) => s.pincode);

  const [sectionsStatus, setSectionsStatus] = useState("idle");
  const [apiSections, setApiSections] = useState([]);

  useEffect(() => {
    if (!cityId && !pincode) {
      setApiSections([]);
      setSectionsStatus("ready");
      return;
    }

    let cancelled = false;
    setSectionsStatus("loading");

    listSections({ cityId, pincode })
      .then((data) => {
        if (cancelled) return;
        setApiSections(normalizeApiSections(data));
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
  }, [cityId, pincode]);

  const categories = useMemo(() => getDemoCategories(), []);

  const sections = useMemo(() => {
    if (apiSections.length > 0) return apiSections;
    return buildDemoSections();
  }, [apiSections]);

  const loading = sectionsStatus === "loading";

  return {
    categories,
    sections,
    loading,
  };
}
