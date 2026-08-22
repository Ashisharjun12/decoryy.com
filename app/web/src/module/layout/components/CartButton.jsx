import { Link } from "react-router-dom";
import { ShoppingBagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart.store";

export function CartButton() {
  const count = useCartStore((s) => s.count);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      nativeButton={false}
      render={<Link to="/bag" />}
    >
      <ShoppingBagIcon />
      <span className="sr-only">Bag</span>
      {count > 0 ? (
        <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
          {count > 9 ? "9+" : count}
        </span>
      ) : null}
    </Button>
  );
}
