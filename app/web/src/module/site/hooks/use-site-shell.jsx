import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getSiteShell } from "@/api/cms.api";

const EMPTY_SHELL = {
  brand: {
    companyName: "Decoryy",
    footerDescription:
      "City-priced decoration setups — balloons, backdrops, and lights, dressed for the room you have.",
    logoLightUrl: null,
    logoDarkUrl: null,
    contactPhone: null,
    contactEmail: null,
    whatsappUrl: null,
  },
  socialLinks: [],
  footerColumns: [],
};

const SiteShellContext = createContext({ ...EMPTY_SHELL, loading: true });

export function SiteShellProvider({ children }) {
  const [remote, setRemote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getSiteShell({ platform: "web" })
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
  }, []);

  const value = useMemo(() => {
    if (!remote) {
      return { ...EMPTY_SHELL, loading };
    }
    return {
      brand: { ...EMPTY_SHELL.brand, ...remote.brand },
      socialLinks: remote.socialLinks ?? [],
      footerColumns: remote.footerColumns ?? [],
      loading,
    };
  }, [remote, loading]);

  return <SiteShellContext.Provider value={value}>{children}</SiteShellContext.Provider>;
}

export function useSiteShell() {
  return useContext(SiteShellContext);
}
