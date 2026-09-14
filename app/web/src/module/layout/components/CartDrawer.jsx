import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2Icon } from "lucide-react";
import { formatPaise } from "@/lib/money";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { DecoryImageFallback } from "@/components/decory-image-fallback";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import { getApiError } from "@/api/api";

export function CartDrawer() {
  const navigate = useNavigate();
  const open = useCartStore((s) => s.open);
  const setOpen = useCartStore((s) => s.setOpen);
  const cart = useCartStore((s) => s.cart);
  const status = useCartStore((s) => s.status);
  const load = useCartStore((s) => s.load);
  const removeItem = useCartStore((s) => s.removeItem);
  const user = useAuthStore((s) => s.user);
  const setLoginOpen = useAuthStore((s) => s.setLoginOpen);

  useEffect(() => {
    if (!open) return;
    void load().catch(() => {});
  }, [open, load]);

  async function onRemove(id) {
    try {
      await removeItem(id);
    } catch (err) {
      toast.add({ title: getApiError(err), type: "error" });
    }
  }

  function onContinue() {
    if (!cart.items?.length) return;
    if (!user) {
      setLoginOpen(true);
      return;
    }
    setOpen(false);
    navigate("/checkout");
  }

  const hasItems = Boolean(cart.items?.length);
  const subtotal = cart.subtotalPaise ?? 0;
  const discount = cart.discountPaise ?? 0;
  const total = cart.totalPaise ?? subtotal;
  const hasAnyAddons = (cart.items ?? []).some((item) => item.addons?.length > 0);

  return (
    <Drawer open={open} onOpenChange={setOpen} swipeDirection="right">
      <DrawerContent
        className={
          "flex h-dvh max-h-dvh flex-col border-y-0 border-r-0 rounded-none rounded-tl-2xl rounded-bl-2xl sm:rounded-tl-3xl sm:rounded-bl-3xl [--drawer-inset:0px] data-[swipe-axis=x]:[--drawer-content-width:100%] sm:data-[swipe-axis=x]:[--drawer-content-width:24rem]"
        }
      >
        <DrawerHeader>
          <DrawerTitle>Your bag</DrawerTitle>
          <DrawerDescription>
            {cart.itemCount
              ? `${cart.itemCount} item${cart.itemCount === 1 ? "" : "s"} ready to book`
              : "Add a setup from the catalog to get started."}
          </DrawerDescription>
        </DrawerHeader>

        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4">
          {status === "loading" && !hasItems ? (
            <div className="flex min-h-40 items-center justify-center">
              <Spinner className="size-6" />
            </div>
          ) : null}

          {!hasItems && status !== "loading" ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Your bag is empty.</p>
          ) : null}

          <ul className="flex flex-col gap-4 pb-4">
            {(cart.items ?? []).map((item) => (
              <li key={item.id} className="flex gap-3 border-b border-border/60 pb-4 last:border-0">
                <span className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-muted">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <DecoryImageFallback />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 flex-1 truncate font-medium leading-snug">{item.name}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="-mt-1 -mr-1 shrink-0 text-muted-foreground hover:text-destructive"
                      aria-label={`Remove ${item.name}`}
                      onClick={() => onRemove(item.id)}
                    >
                      <Trash2Icon />
                    </Button>
                  </div>

                  {item.addons?.length ? (
                    <div className="mt-1.5 space-y-1 text-xs text-muted-foreground">
                      {item.addons.map((addon) => (
                        <div key={addon.id} className="flex items-baseline justify-between gap-3">
                          <span className="min-w-0 truncate pl-2 before:mr-1.5 before:content-['+']">
                            {addon.name}
                          </span>
                          <span className="shrink-0 tabular-nums">
                            {addon.pricePaise > 0 ? formatPaise(addon.pricePaise) : "Free"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <p className="mt-2 text-sm font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                    {formatPaise(item.lineTotalPaise)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <DrawerFooter className="gap-3 border-t border-border/60 bg-muted/30">
          {hasItems ? (
            <div className="flex flex-col gap-1.5">
              {discount > 0 ? (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatPaise(subtotal)}</span>
                </div>
              ) : null}
              {discount > 0 ? (
                <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400">
                  <span>
                    Discount
                    {cart.appliedCoupon?.code ? ` (${cart.appliedCoupon.code})` : ""}
                  </span>
                  <span className="tabular-nums">−{formatPaise(discount)}</span>
                </div>
              ) : null}
              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Total to pay</p>
                  <p className="text-xl font-semibold tracking-tight tabular-nums text-emerald-700 dark:text-emerald-400">
                    {formatPaise(total)}
                  </p>
                </div>
                {hasAnyAddons ? (
                  <p className="pb-0.5 text-right text-xs text-muted-foreground">
                    Incl. selected add-ons
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}
          <Button type="button" size="lg" disabled={!hasItems} onClick={onContinue}>
            Continue
          </Button>
          <DrawerClose render={<Button type="button" variant="outline">Keep browsing</Button>} />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
