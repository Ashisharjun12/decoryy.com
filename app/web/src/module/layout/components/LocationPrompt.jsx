import { useState } from "react";
import { LocateFixedIcon, MapPinIcon, XIcon } from "lucide-react";
import { getApiError } from "@/api/api";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { detectLocationFromDevice } from "@/module/geo/detect-location";
import {
  formatLocationLabel,
  isBackendCityId,
  LOCATION_PROMPT_DISMISSED_KEY,
  useLocationStore,
} from "@/store/location.store";
import { useCartStore } from "@/store/cart.store";

export function LocationPrompt() {
  const needsPrompt = useLocationStore((s) => s.needsPrompt);
  const status = useLocationStore((s) => s.status);
  const setLocation = useLocationStore((s) => s.setLocation);
  const setPickerOpen = useLocationStore((s) => s.setPickerOpen);
  const setNeedsPrompt = useLocationStore((s) => s.setNeedsPrompt);
  const setCartLocation = useCartStore((s) => s.setLocation);
  const [pending, setPending] = useState(false);

  if (status !== "ready" || !needsPrompt) {
    return null;
  }

  function dismiss() {
    sessionStorage.setItem(LOCATION_PROMPT_DISMISSED_KEY, "1");
    setNeedsPrompt(false);
  }

  async function onDetectLocation() {
    if (pending) return;
    setPending(true);
    try {
      const location = await detectLocationFromDevice();
      setLocation(location);
      if (location.city?.id && isBackendCityId(location.city.id)) {
        const pin = location.pincode?.code?.replace(/\D/g, "").slice(0, 6);
        void setCartLocation(
          pin ? { cityId: location.city.id, pincode: pin } : { cityId: location.city.id },
        ).catch(() => {});
      }
      sessionStorage.setItem(LOCATION_PROMPT_DISMISSED_KEY, "1");
      toast.add({
        title: `Set to ${formatLocationLabel(location.city, location.pincode, location.source)}`,
        type: "success",
      });
    } catch (err) {
      toast.add({ title: getApiError(err), type: "error" });
      setPickerOpen(true);
    } finally {
      setPending(false);
    }
  }

  function onChooseCity() {
    dismiss();
    setPickerOpen(true);
  }

  return (
    <div className="border-b border-border bg-muted/40">
      <div className="relative mx-auto w-full max-w-[1240px] px-4 py-3 md:px-8">
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          className="absolute right-2 top-2 rounded-full md:right-6 md:top-3"
          aria-label="Dismiss"
          disabled={pending}
          onClick={dismiss}
        >
          <XIcon className="size-4" />
        </Button>

        <div className="flex flex-col gap-3 pr-8 md:flex-row md:items-center md:gap-4 md:pr-0">
          <div className="flex min-w-0 items-start gap-3 md:flex-1">
            <MapPinIcon className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="min-w-0 text-sm leading-snug">
              <span className="font-medium text-foreground">Show setups for your area</span>
              <span className="mt-0.5 block text-muted-foreground sm:mt-0 sm:inline">
                <span className="hidden sm:inline"> — </span>
                Use your location or pick a city for local pricing.
              </span>
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 md:flex md:w-auto md:shrink-0">
            <Button
              type="button"
              size="sm"
              className="w-full rounded-full md:w-auto"
              disabled={pending}
              onClick={onDetectLocation}
            >
              {pending ? (
                <Spinner className="size-3.5" />
              ) : (
                <LocateFixedIcon className="size-3.5 shrink-0" />
              )}
              Use my location
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="w-full rounded-full md:w-auto"
              disabled={pending}
              onClick={onChooseCity}
            >
              Choose city
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
