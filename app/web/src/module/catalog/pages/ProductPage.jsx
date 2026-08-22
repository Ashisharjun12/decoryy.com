import { Link, useParams } from "react-router-dom";

export function ProductPage() {
  const { id } = useParams();

  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 py-12 md:px-8">
      <p className="text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        {" / "}
        Setup
      </p>
      <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight">
        Product
      </h1>
      <p className="mt-3 max-w-[65ch] text-sm text-muted-foreground">
        Full product page is next. This setup id is {id}.
      </p>
    </div>
  );
}
