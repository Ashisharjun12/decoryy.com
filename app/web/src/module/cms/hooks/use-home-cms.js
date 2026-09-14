import { useEffect, useMemo, useState } from "react";
import { getHomeCms } from "@/api/cms.api";
import { isBackendCityId, useLocationStore } from "@/store/location.store";

const EMPTY_CMS = {
  announcements: [],
  announcement: null,
  hero: [],
  mid: [],
  end: [],
  testimonials: [],
};

export function useHomeCms() {
  const city = useLocationStore((s) => s.city);
  const cityId = isBackendCityId(city?.id) ? city.id : city?.id ?? null;

  const [remote, setRemote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getHomeCms({ cityId: isBackendCityId(cityId) ? cityId : undefined, platform: "web" })
      .then((data) => {
        if (!cancelled) setRemote(data);
      })
      .catch(() => {
        if (!cancelled) setRemote(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [cityId]);

  const resolved = useMemo(() => {
    if (!remote) return { ...EMPTY_CMS };

    return {
      announcements: remote.announcements ?? (remote.announcement ? [remote.announcement] : []),
      announcement: remote.announcement ?? null,
      hero: remote.hero ?? [],
      mid: remote.mid ?? [],
      end: remote.end ?? [],
      testimonials: remote.testimonials ?? [],
    };
  }, [remote]);

  return { ...resolved, loading };
}

export function useAnnouncementCms() {
  const { announcements } = useHomeCms();
  return announcements ?? [];
}
