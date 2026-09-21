import { useMemo, useState } from "react";
import { MapPinCheckIcon, MapPinIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeliveryMapConfirmDialog } from "@/module/geo/components/DeliveryMapConfirmDialog";
import { useCartStore } from "@/store/cart.store";
import { toast } from "@/components/ui/toast";
import { getApiError } from "@/api/api";

export function CheckoutDeliveryGeo({
  deliveryOk,
  delivery,
  geoConfirmed,
  onGeoConfirmed,
  requireGeo,
}) {
  const setDeliveryGeo = useCartStore((s) => s.setDeliveryGeo);
  const cart = useCartStore((s) => s.cart);
  const [mapOpen, setMapOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const canOpenMap = deliveryOk;
  const hasCartGeo =
    cart?.deliveryLatitude != null && cart?.deliveryLongitude != null && geoConfirmed;

  const addressSummary = useMemo(() => {
    if (!delivery?.address?.trim()) return null;
    const pin = (delivery.pincode ?? "").replace(/\D/g, "").slice(0, 6);
    return {
      label: "Delivery address",
      meta: delivery.cityName
        ? `${delivery.cityName}${pin ? ` · ${pin}` : ""}`
        : pin || "",
      line: delivery.address.trim(),
      landmark: delivery.landmark?.trim() || "",
    };
  }, [delivery]);

  async function handleConfirm(coords) {
    setSaving(true);
    try {
      await setDeliveryGeo(coords);
      onGeoConfirmed?.(true);
      setMapOpen(false);
      toast.add({ title: "Delivery location saved", type: "success" });
    } catch (err) {
      toast.add({ title: getApiError(err), type: "error" });
    } finally {
      setSaving(false);
    }
  }

  if (!canOpenMap && !hasCartGeo) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border bg-muted/20 px-4 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          {hasCartGeo ? (
            <MapPinCheckIcon className="size-5 shrink-0 text-emerald-600" aria-hidden />
          ) : (
            <MapPinIcon className="size-5 shrink-0 text-primary" aria-hidden />
          )}
          <div>
            <p className="text-sm font-medium text-foreground">
              {hasCartGeo ? "Location confirmed on map" : "Confirm on map"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {requireGeo
                ? "Required for instant delivery so we can assign the nearest decorator."
                : "Optional — pin your venue on setup day to see live tracking when your decorator is on the way."}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant={hasCartGeo ? "outline" : "default"}
          size="sm"
          className="shrink-0"
          disabled={!canOpenMap || saving}
          onClick={() => setMapOpen(true)}
        >
          {hasCartGeo ? "Adjust pin" : "Open map"}
        </Button>
      </div>
      <DeliveryMapConfirmDialog
        open={mapOpen}
        onOpenChange={setMapOpen}
        initialLatitude={cart?.deliveryLatitude ?? delivery?.latitude ?? null}
        initialLongitude={cart?.deliveryLongitude ?? delivery?.longitude ?? null}
        addressSummary={addressSummary}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
