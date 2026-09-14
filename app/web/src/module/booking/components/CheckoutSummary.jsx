import { formatPaise } from "@/lib/money"
import { DecoryImageFallback } from "@/components/decory-image-fallback"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckoutCouponBox } from "@/module/booking/components/CheckoutCouponBox"

export function CheckoutSummary({ cart, paymentMethod }) {
  const items = cart?.items ?? []
  const subtotal = cart?.subtotalPaise ?? 0
  const discount = cart?.discountPaise ?? 0
  const total = cart?.totalPaise ?? subtotal
  const appliedCoupon = cart?.appliedCoupon
  const hasAnyAddons = items.some((item) => item.addons?.length > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your setup</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.id} className="flex gap-3">
              <span className="relative size-14 shrink-0 overflow-hidden rounded-2xl bg-muted">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt="" className="size-full object-cover" />
                ) : (
                  <DecoryImageFallback />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.name}</p>
                {item.addons?.length ? (
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {item.addons.map((addon) => addon.name).join(" · ")}
                  </p>
                ) : null}
                <p className="mt-1 text-sm font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                  {formatPaise(item.lineTotalPaise)}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <CheckoutCouponBox cart={cart} paymentMethod={paymentMethod} />

        <div className="flex flex-col gap-2 border-t border-border/60 pt-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="tabular-nums">{formatPaise(subtotal)}</span>
          </div>
          {discount > 0 ? (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Discount{appliedCoupon?.code ? ` (${appliedCoupon.code})` : ""}
              </span>
              <span className="tabular-nums text-emerald-700 dark:text-emerald-400">
                −{formatPaise(discount)}
              </span>
            </div>
          ) : null}
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Total to pay</p>
              <p className="text-lg font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                {formatPaise(total)}
              </p>
            </div>
            {hasAnyAddons ? (
              <p className="pb-0.5 text-right text-xs text-muted-foreground">Incl. add-ons</p>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
