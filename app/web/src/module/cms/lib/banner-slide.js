export function hasBannerOverlay(slide) {
  if (!slide) return false;
  return Boolean(
    slide.tag?.trim() ||
      slide.title?.trim() ||
      slide.subtitle?.trim() ||
      slide.ctaLabel?.trim() ||
      slide.secondaryLabel?.trim(),
  );
}

export function normalizeHeroSlide(row) {
  return {
    id: row.id,
    imageUrl: row.imageUrl ?? row.image?.url ?? "",
    href: row.href?.trim() ? row.href.trim() : null,
    alt: row.alt?.trim() || row.title?.trim() || "Banner",
    tag: row.tag?.trim() || null,
    title: row.title?.trim() || null,
    subtitle: row.subtitle?.trim() || null,
    ctaLabel: row.ctaLabel?.trim() || null,
    secondaryLabel: row.secondaryLabel?.trim() || null,
    secondaryHref: row.secondaryHref?.trim() || null,
  };
}
