import { Link, useParams } from "react-router-dom";
import { categoryPath } from "@/lib/catalog-path";
import { DEMO_CATEGORIES } from "@/module/home/data/demo-categories";

export function CategoryPage() {
  const { parentSlug, childSlug } = useParams();
  const parent = DEMO_CATEGORIES.find((category) => category.slug === parentSlug);
  const title = parent?.name || parentSlug;

  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 py-12 md:px-8">
      <p className="text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        {parent ? (
          <>
            {" / "}
            <Link to={categoryPath(parent)} className="hover:text-foreground">
              {parent.name}
            </Link>
          </>
        ) : null}
        {childSlug ? ` / ${childSlug}` : null}
      </p>
      <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight">
        {title}
      </h1>
      <p className="mt-3 max-w-[65ch] text-sm text-muted-foreground">
        Product listing for this occasion will land here. Setups on the home
        page are demo-priced for the city in the header.
      </p>
    </div>
  );
}
