import { useState } from "react";
import { LocateFixedIcon, MapPinIcon, XIcon } from "lucide-react";
import { getApiError } from "@/api/api";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { detectLocationFromDevice } from "@/module/geo/detect-location";
import {
  formatLocationLabel,
  LOCATION_PROMPT_DISMISSED_KEY,
  useLocationStore,
} from "@/store/location.store";

export function LocationPrompt() {
  const needsPrompt = useLocationStore((s) => s.needsPrompt);
  const status = useLocationStore((s) => s.status);
  const setLocation = useLocationStore((s) => s.setLocation);
  const setPickerOpen = useLocationStore((s) => s.setPickerOpen);
  const setNeedsPrompt = useLocationStore((s) => s.setNeedsPrompt);
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
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-3 px-4 py-3 md:px-8">
        <MapPinIcon className="size-4 shrink-0 text-primary" />
        <p className="min-w-0 flex-1 text-sm">
          <span className="font-medium">Show setups for your area</span>
          <span className="text-muted-foreground">
            {" "}
            — use your location or pick a city for local pricing.
          </span>
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            size="sm"
            className="rounded-full"
            disabled={pending}
            onClick={onDetectLocation}
          >
            {pending ? (
              <Spinner className="size-3.5" />
            ) : (
              <LocateFixedIcon className="size-3.5" />
            )}
            Use my location
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-full"
            disabled={pending}
            onClick={onChooseCity}
          >
            Choose city
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="rounded-full"
            aria-label="Dismiss"
            disabled={pending}
            onClick={dismiss}
          >
            <XIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
