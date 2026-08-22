export function categoryPath(parent, child) {
  if (child?.slug) return `/c/${parent.slug}/${child.slug}`;
  return `/c/${parent.slug}`;
}

export function productPath(product) {
  return `/p/${product.id}`;
}
