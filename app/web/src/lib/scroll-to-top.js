import { getLenis } from "@/lib/lenis-instance";

/**
 * @param {{ behavior?: "auto" | "smooth" }} [options]
 */
export function scrollToTop({ behavior = "smooth" } = {}) {
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(0, { immediate: behavior === "auto" });
    return;
  }
  window.scrollTo({ top: 0, left: 0, behavior });
}
