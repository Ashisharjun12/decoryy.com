import { useEffect, useState } from "react"
import { XIcon } from "lucide-react"
import { getApiError } from "@/api/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  const needsCity = couponRequiresCity(cart)
  const paymentWarning = getCouponPaymentWarning(appliedCoupon, paymentMethod)

  const [open, setOpen] = useState(false)
  const [code, setCode] = useState(appliedCoupon?.code ?? "")
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (appliedCoupon?.code) {
      setCode(appliedCoupon.code)
      setOpen(false)
    }
  }, [appliedCoupon?.code])

  async function onApply() {
    const trimmed = code.trim()
    if (!trimmed || needsCity) return

    setApplying(true)
    setError("")
    try {
      await applyCoupon(trimmed)
      setOpen(false)
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
        {paymentWarning ? (
          <Alert variant="destructive" className="rounded-lg py-2.5">
            <AlertDescription className="text-xs leading-relaxed">{paymentWarning}</AlertDescription>
          </Alert>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-auto w-fit px-0 text-xs text-muted-foreground"
          disabled={applying}
          onClick={onRemove}
        >
          {applying ? <Spinner className="size-3.5" /> : <XIcon className="mr-1 inline size-3.5" />}
          Remove coupon
        </Button>
        {error ? (
          <Alert variant="destructive" className="rounded-lg py-2.5">
            <AlertDescription className="text-xs leading-relaxed">{error}</AlertDescription>
          </Alert>
        ) : null}
      </div>
    )
  }

  if (!open) {
    return (
      <div className={cn(className)}>
        <button
          type="button"
          className="text-sm font-semibold text-foreground underline-offset-4 hover:underline"
          onClick={() => setOpen(true)}
        >
          Add coupon code
        </button>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <Input
        placeholder="Paste coupon code"
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
        className="rounded-lg font-semibold uppercase tracking-wide"
      />
      <Button
        type="button"
        className="w-full rounded-lg bg-emerald-600 font-semibold text-white hover:bg-emerald-700"
        onClick={onApply}
        disabled={applying || needsCity || !code.trim()}
      >
        {applying ? <Spinner className="size-4" /> : "Apply"}
      </Button>

      {needsCity ? (
        <p className="text-xs text-muted-foreground">
          Select your delivery city first to apply a coupon.
        </p>
      ) : null}

      {error ? (
        <Alert variant="destructive" className="rounded-lg py-2.5">
          <AlertDescription className="text-xs leading-relaxed">{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  )
}
