import { useCallback, useEffect, useRef, useState } from "react";
import { LocateFixed } from "lucide-react";
import { getDeviceCoords } from "@/lib/geolocation";
import { getMapPinIconUrl, useMapsSdkConfig } from "@/lib/ola-maps-env";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import {
  INDIA_CENTER,
  isInsideIndiaBounds,
} from "@/module/geo/lib/india-map";
import { OlaPinMap } from "@/module/geo/components/OlaPinMap";

const DEFAULT_ZOOM_GPS = 17;
const DEFAULT_ZOOM_PIN = 15;
const DEFAULT_ZOOM_FALLBACK = 5;

function MapPinConfirmBody({
  mapKey,
  initialCenter,
  initialZoom,
  pinUrl,
  sdkConfig,
  onUseCurrentLocation,
  locating,
  onConfirm,
  onCancel,
  confirmLabel,
  saving,
}) {
  const centerRef = useRef(initialCenter);

  useEffect(() => {
    centerRef.current = initialCenter;
  }, [initialCenter, mapKey]);

  const handleConfirm = () => {
    const lat = centerRef.current.lat;
    const lng = centerRef.current.lng;
    if (!isInsideIndiaBounds(lat, lng)) {
      toast.add({ title: "Select a location within India", type: "error" });
      return;
    }
    onConfirm({ latitude: lat, longitude: lng });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative h-[min(48vh,380px)] w-full overflow-hidden rounded-xl border border-border">
        <OlaPinMap
          mapKey={mapKey}
          sdkConfig={sdkConfig}
          center={initialCenter}
          zoom={initialZoom}
          onCenterChange={(next) => {
            centerRef.current = next;
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden
        >
          <img
            src={pinUrl}
            alt=""
            className="size-12 -translate-y-6 object-contain drop-shadow-md"
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="absolute right-3 top-3 z-10 gap-1.5 shadow-md"
          onClick={onUseCurrentLocation}
          disabled={locating || saving}
        >
          {locating ? <Spinner className="size-3.5" /> : <LocateFixed className="size-3.5" />}
          Current location
        </Button>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Move the map so the pin sits on your delivery spot.
      </p>
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel} disabled={saving}>
          Back
        </Button>
        <Button type="button" className="flex-1" onClick={handleConfirm} disabled={saving}>
          {saving ? <Spinner className="size-4" /> : confirmLabel}
        </Button>
      </div>
    </div>
  );
}

export function DeliveryMapConfirmDialog({
  open,
  onOpenChange,
  initialLatitude,
  initialLongitude,
  addressSummary,
  confirmLabel = "Confirm location",
  saving = false,
  closeOnConfirm = true,
  onConfirm,
}) {
  const [ready, setReady] = useState(false);
  const [mapCenter, setMapCenter] = useState(INDIA_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM_FALLBACK);
  const [loading, setLoading] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [locating, setLocating] = useState(false);
  const pinUrl = getMapPinIconUrl();
  const { config: sdkConfig, loading: sdkLoading, error: sdkError } = useMapsSdkConfig();

  const resolveInitialView = useCallback(async () => {
    setLoading(true);
    try {
      const coords = await getDeviceCoords();
      if (isInsideIndiaBounds(coords.latitude, coords.longitude)) {
        setMapCenter({ lat: coords.latitude, lng: coords.longitude });
        setMapZoom(DEFAULT_ZOOM_GPS);
      } else {
        setMapCenter(INDIA_CENTER);
        setMapZoom(DEFAULT_ZOOM_FALLBACK);
      }
    } catch {
      setMapCenter(INDIA_CENTER);
      setMapZoom(DEFAULT_ZOOM_FALLBACK);
    } finally {
      setLoading(false);
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      setReady(false);
      return;
    }
    setMapKey((k) => k + 1);
    if (initialLatitude != null && initialLongitude != null) {
      setMapCenter({ lat: initialLatitude, lng: initialLongitude });
      setMapZoom(DEFAULT_ZOOM_PIN);
      setReady(true);
      return;
    }
    void resolveInitialView();
  }, [open, initialLatitude, initialLongitude, resolveInitialView]);

  function handleClose() {
    if (saving) return;
    onOpenChange(false);
  }

  async function handleUseCurrentLocation() {
    setLocating(true);
    try {
      const coords = await getDeviceCoords();
      if (!isInsideIndiaBounds(coords.latitude, coords.longitude)) {
        toast.add({ title: "Your location is outside India", type: "error" });
        return;
      }
      setMapCenter({ lat: coords.latitude, lng: coords.longitude });
      setMapZoom(DEFAULT_ZOOM_GPS);
      setMapKey((k) => k + 1);
    } catch {
      toast.add({ title: "Could not get your location", type: "error" });
    } finally {
      setLocating(false);
    }
  }

  if (sdkError) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Map unavailable</DialogTitle>
            <DialogDescription>
              Maps are not configured on the server. Set OLA_MAPS_CLIENT_ID and OLA_MAPS_CLIENT_SECRET
              (or OLA_MAPS_API_KEY) in the API environment.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Review & pin location</DialogTitle>
          <DialogDescription>
            Check the address below, then move the map to your exact delivery spot.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-6 pb-6">
          {addressSummary ? (
            <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm">
              <p className="font-semibold text-foreground">{addressSummary.label}</p>
              <p className="mt-1 text-muted-foreground">{addressSummary.meta}</p>
              <p className="mt-2 text-foreground">{addressSummary.line}</p>
              {addressSummary.landmark ? (
                <p className="mt-1 text-muted-foreground">Near {addressSummary.landmark}</p>
              ) : null}
            </div>
          ) : null}
          {!ready || loading || sdkLoading || !sdkConfig ? (
            <div className="flex h-48 items-center justify-center">
              <Spinner className="size-8" />
            </div>
          ) : (
            <MapPinConfirmBody
              mapKey={mapKey}
              sdkConfig={sdkConfig}
              initialCenter={mapCenter}
              initialZoom={mapZoom}
              pinUrl={pinUrl}
              locating={locating}
              onUseCurrentLocation={() => void handleUseCurrentLocation()}
              confirmLabel={confirmLabel}
              saving={saving}
              onConfirm={(coords) => {
                onConfirm?.(coords);
                if (closeOnConfirm && !saving) handleClose();
              }}
              onCancel={handleClose}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
