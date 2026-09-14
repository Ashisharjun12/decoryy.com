import { DEMO_HOME_CATEGORIES } from "@/module/home/data/demo-home-categories";
import { DEMO_SECTION_META } from "@/module/home/data/demo-category-tree";
import { DEMO_PRODUCTS } from "@/module/home/data/demo-products";

export function categoryImageUrl(category) {
  if (!category) return null;
  return (
    category.imageUrl ??
    category.image?.url ??
    category.image?.optimizedUrl ??
    category.image?.publicUrl ??
    null
  );
}

export function normalizeCategory(raw) {
  if (!raw) return null;
  const children = Array.isArray(raw.children)
    ? raw.children.map(normalizeCategory).filter(Boolean)
    : [];

  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    parentId: raw.parentId ?? null,
    iconKey: raw.iconKey ?? null,
    iconTone: raw.iconTone ?? null,
    imageUrl: categoryImageUrl(raw),
    tileBg: raw.tileBg ?? "bg-amber-50",
    children,
  };
}

export function normalizeCategoryTree(items) {
  if (!Array.isArray(items) || items.length === 0) return [];
  return items.map(normalizeCategory).filter(Boolean);
}

export function normalizeProduct(raw) {
  if (!raw) return null;
  const imageUrl =
    raw.imageUrl ??
    raw.images?.[0]?.url ??
    raw.images?.[0]?.optimizedUrl ??
    raw.images?.[0]?.publicUrl ??
    null;

  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    pricePaise: raw.pricePaise ?? 0,
    compareAtPaise: raw.compareAtPaise ?? null,
    rating:
      raw.ratingAvg != null
        ? Number(raw.ratingAvg)
        : raw.rating != null
          ? Number(raw.rating)
          : null,
    reviewCount: raw.reviewCount != null ? Number(raw.reviewCount) : null,
    tag: raw.tag ?? null,
    meta: raw.meta ?? null,
    sectionSlug: raw.sectionSlug ?? null,
    imageUrl,
    images: raw.images ?? (imageUrl ? [{ url: imageUrl }] : []),
  };
}

export function normalizeSection(raw) {
  if (!raw) return null;
  const items = Array.isArray(raw.items)
    ? raw.items.map(normalizeProduct).filter(Boolean)
    : [];

  return {
    id: raw.id ?? raw.slug,
    slug: raw.slug,
    name: raw.name,
    sortIndex: raw.sortIndex ?? 0,
    items,
  };
}

export function getDemoCategories() {
  return normalizeCategoryTree(DEMO_HOME_CATEGORIES);
}

export function buildDemoSections() {
  const bySlug = new Map(
    DEMO_SECTION_META.map((meta) => [
      meta.slug,
      { ...meta, id: meta.slug, sortIndex: 0, items: [] },
    ]),
  );

  for (const product of DEMO_PRODUCTS) {
    const normalized = normalizeProduct(product);
    const section = bySlug.get(product.sectionSlug);
    if (section && normalized) {
      section.items.push(normalized);
    }
  }

  return [...bySlug.values()]
    .map(normalizeSection)
    .filter((section) => section && section.items.length > 0);
}

export function normalizeApiSections(response) {
  const sections = response?.sections ?? response ?? [];
  if (!Array.isArray(sections) || sections.length === 0) return [];

  return sections
    .map((section) =>
      normalizeSection({
        id: section.id,
        slug: section.slug,
        name: section.name,
        sortIndex: section.sortIndex,
        items: section.items,
      }),
    )
    .filter((section) => section && section.items.length > 0);
}
