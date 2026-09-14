import { useMemo, useState } from "react"
import { MapPinIcon, PackageIcon, RefreshCwIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Field,
  FieldError,
  FieldGroup,
} from "@/components/ui/field"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { BookingPreviewThumb } from "@/module/bookings/components/BookingPreviewThumb"
import { PackagePickerDialog } from "@/module/bookings/package-picker"
import { PackageAddonPrice } from "@/module/bookings/package-picker/PackageAddonPrice"
import { PackageProductPrice } from "@/module/bookings/package-picker/PackageProductPrice"
import {
  formatBookingDate,
  formatBookingTime,
} from "@/module/bookings/lib/booking-format"

export function CreateBookingOrderCard({
  form,
  orderSelection,
  preview,
  onOrderSelectionChange,
  onPackageCityChange,
}) {
  const [pickerOpen, setPickerOpen] = useState(false)

  const cityId = form.watch("delivery.cityId")

  const initialSelection = useMemo(() => {
    if (!orderSelection?.productId) return null
    return {
      productId: orderSelection.productId,
      productName: orderSelection.productName,
      scheduledAt: orderSelection.scheduledAt,
      quantity: orderSelection.quantity,
      addonIds: orderSelection.addonIds,
    }
  }, [orderSelection])

  function handleConfirm(selection) {
    const current = form.getValues()
    form.reset(
      {
        ...current,
        productId: selection.productId,
        scheduledAt: selection.scheduledAt,
        quantity: selection.quantity,
        addonIds: selection.addonIds ?? [],
        delivery: {
          ...current.delivery,
          cityId: selection.cityId,
        },
      },
      { keepDefaultValues: true },
    )
    onOrderSelectionChange(selection)
    onPackageCityChange?.({ id: selection.cityId, name: selection.cityName })
  }

  if (!orderSelection) {
    return (
      <>
        <FieldGroup>
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <PackageIcon />
              </EmptyMedia>
              <EmptyTitle>No package selected</EmptyTitle>
              <EmptyDescription>
                Choose a city, decoration package, setup slot, and optional add-ons.
              </EmptyDescription>
            </EmptyHeader>
            <Button type="button" variant="outline" onClick={() => setPickerOpen(true)}>
              Select package
            </Button>
          </Empty>
          {form.formState.errors.productId ? (
            <Field data-invalid>
              <FieldError errors={[form.formState.errors.productId]} />
            </Field>
          ) : null}
        </FieldGroup>

        <PackagePickerDialog
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          initialCityId={cityId}
          initialSelection={null}
          onConfirm={handleConfirm}
        />
      </>
    )
  }

  return (
    <>
      <FieldGroup>
        <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4">
          <div className="flex items-start gap-3">
            {preview.loading && !preview.coverUrl ? (
              <Skeleton className="size-14 shrink-0 rounded-lg" />
            ) : (
              <BookingPreviewThumb
                src={preview.coverUrl}
                alt={preview.productName}
                size="md"
                className="size-14"
              />
            )}
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium leading-snug">
                  {preview.productName || orderSelection.productName || "Selected package"}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => setPickerOpen(true)}
                >
                  <RefreshCwIcon className="size-4" />
                  Replace
                </Button>
              </div>
              {preview.loading && preview.price?.pricePaise == null ? (
                <Skeleton className="h-5 w-32" />
              ) : (
                <PackageProductPrice
                  compact
                  pricePaise={preview.price?.pricePaise ?? null}
                  compareAtPaise={preview.price?.compareAtPaise ?? null}
                  cityName={orderSelection.cityName}
                />
              )}
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span>{formatBookingDate(orderSelection.scheduledAt)}</span>
                <span>{formatBookingTime(orderSelection.scheduledAt)}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {orderSelection.cityName ? (
                  <Badge variant="secondary" className="gap-1">
                    <MapPinIcon className="size-3" />
                    {orderSelection.cityName}
                  </Badge>
                ) : null}
                <Badge variant="secondary">Qty {orderSelection.quantity}</Badge>
              </div>
            </div>
          </div>

          {preview.addons.length > 0 ? (
            <div className="space-y-2 border-t pt-3">
              <p className="text-sm font-medium">Add-ons</p>
              <ul className="space-y-2">
                {preview.addons.map((addon) => (
                  <li key={addon.id} className="flex items-center gap-2">
                    <BookingPreviewThumb src={addon.coverUrl} alt={addon.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{addon.name}</p>
                      <PackageAddonPrice
                        pricePaise={addon.pricePaise}
                        compareAtPaise={addon.compareAtPaise}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        {form.formState.errors.productId ? (
          <Field data-invalid>
            <FieldError errors={[form.formState.errors.productId]} />
          </Field>
        ) : null}
        {form.formState.errors.scheduledAt ? (
          <Field data-invalid>
            <FieldError errors={[form.formState.errors.scheduledAt]} />
          </Field>
        ) : null}
        {form.formState.errors.delivery?.cityId ? (
          <Field data-invalid>
            <FieldError errors={[form.formState.errors.delivery.cityId]} />
          </Field>
        ) : null}
      </FieldGroup>

      <PackagePickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        initialCityId={cityId}
        initialSelection={initialSelection}
        onConfirm={handleConfirm}
      />
    </>
  )
}
