import { useEffect, useState } from "react"
import { ChevronDownIcon, TagIcon, XIcon } from "lucide-react"
import { formatPaise } from "@/lib/money"
import { getApiError } from "@/api/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { useCartStore } from "@/store/cart.store"
import {
  couponRequiresCity,
  getCouponPaymentWarning,
} from "@/module/booking/lib/coupon-eligibility"

export function CheckoutCouponBox({
  cart,
  paymentMethod,
  className,
}) {
  const applyCoupon = useCartStore((s) => s.applyCoupon)
  const removeCoupon = useCartStore((s) => s.removeCoupon)

  const appliedCoupon = cart?.appliedCoupon
  const discount = cart?.discountPaise ?? 0
  const needsCity = couponRequiresCity(cart)
  const paymentWarning = getCouponPaymentWarning(appliedCoupon, paymentMethod)

  const [open, setOpen] = useState(Boolean(appliedCoupon))
  const [code, setCode] = useState(appliedCoupon?.code ?? "")
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (appliedCoupon?.code) {
      setCode(appliedCoupon.code)
      setOpen(true)
    }
  }, [appliedCoupon?.code])

  async function onApply() {
    const trimmed = code.trim()
    if (!trimmed || needsCity) return

    setApplying(true)
    setError("")
    try {
      await applyCoupon(trimmed)
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setApplying(false)
    }
  }

  async function onRemove() {
    setApplying(true)
    setError("")
    try {
      await removeCoupon()
      setCode("")
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setApplying(false)
    }
  }

  function onKeyDown(event) {
    if (event.key !== "Enter" || applying || appliedCoupon) return
    event.preventDefault()
    void onApply()
  }

  if (appliedCoupon) {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className="h-7 max-w-full gap-1.5 rounded-full px-2.5 font-mono text-xs tracking-wide"
            >
              <TagIcon className="size-3 shrink-0" />
              <span className="truncate uppercase">{appliedCoupon.code}</span>
            </Badge>
            {discount > 0 ? (
              <span className="text-xs font-medium text-emerald-700 tabular-nums dark:text-emerald-400">
                −{formatPaise(discount)}
              </span>
            ) : null}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-muted-foreground"
            aria-label="Remove coupon"
            disabled={applying}
            onClick={onRemove}
          >
            {applying ? <Spinner className="size-3.5" /> : <XIcon className="size-4" />}
          </Button>
        </div>

        {paymentWarning ? (
          <Alert variant="destructive" className="rounded-xl py-2.5">
            <AlertDescription className="text-xs leading-relaxed">{paymentWarning}</AlertDescription>
          </Alert>
        ) : null}

        {error ? (
          <Alert variant="destructive" className="rounded-xl py-2.5">
            <AlertDescription className="text-xs leading-relaxed">{error}</AlertDescription>
          </Alert>
        ) : null}
      </div>
    )
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} className={className}>
      <CollapsibleTrigger
        type="button"
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-dashed border-border/80 bg-muted/20 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/40"
      >
        <span className="inline-flex items-center gap-2 font-medium">
          <TagIcon className="size-4 text-muted-foreground" />
          Have a promo code?
        </span>
        <ChevronDownIcon
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </CollapsibleTrigger>

      <CollapsibleContent className="pt-2">
        <div className="flex flex-col gap-2">
          <InputGroup>
            <InputGroupInput
              placeholder="Enter code"
              value={code}
              onChange={(event) => {
                setCode(event.target.value.toUpperCase())
                if (error) setError("")
              }}
              onKeyDown={onKeyDown}
              aria-label="Coupon code"
              aria-invalid={Boolean(error)}
              disabled={applying || needsCity}
              autoComplete="off"
              spellCheck={false}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={onApply}
                disabled={applying || needsCity || !code.trim()}
              >
                {applying ? <Spinner className="size-3.5" /> : "Apply"}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>

          {needsCity ? (
            <p className="text-xs text-muted-foreground">
              Select your delivery city first to apply a coupon.
            </p>
          ) : null}

          {error ? (
            <Alert variant="destructive" className="rounded-xl py-2.5">
              <AlertDescription className="text-xs leading-relaxed">{error}</AlertDescription>
            </Alert>
          ) : null}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
