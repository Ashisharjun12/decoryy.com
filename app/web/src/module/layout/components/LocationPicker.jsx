import { useMemo, useState } from "react";
import {
  CheckIcon,
  ChevronDownIcon,
  LocateFixedIcon,
  MapPinIcon,
  SearchIcon,
} from "lucide-react";
import { getApiError } from "@/api/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { detectLocationFromDevice } from "@/module/geo/detect-location";
import {
  formatLocationLabel,
  useLocationStore,
} from "@/store/location.store";

function CityChip({ city, pincode, source, className, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-10 max-w-[13rem] cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-3.5 text-left text-[13.5px] transition-shadow hover:border-primary hover:shadow-sm sm:max-w-none",
        className,
      )}
      {...props}
    >
      <MapPinIcon className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="min-w-0 truncate font-bold">
        {formatLocationLabel(city, pincode, source)}
      </span>
      <ChevronDownIcon className="size-3.5 shrink-0 text-muted-foreground" />
    </button>
  );
}

export function LocationPicker() {
  const city = useLocationStore((s) => s.city);
  const pincode = useLocationStore((s) => s.pincode);
  const source = useLocationStore((s) => s.source);
  const cities = useLocationStore((s) => s.cities);
  const pickerOpen = useLocationStore((s) => s.pickerOpen);
  const setPickerOpen = useLocationStore((s) => s.setPickerOpen);
  const setLocation = useLocationStore((s) => s.setLocation);
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.state.toLowerCase().includes(q),
    );
  }, [cities, query]);

  async function onDetectLocation() {
    if (pending) return;
    setPending(true);
    try {
      const location = await detectLocationFromDevice();
      setLocation(location);
      toast.add({
        title: `Set to ${formatLocationLabel(location.city, location.pincode, location.source)}`,
        type: "success",
      });
    } catch (err) {
      toast.add({ title: getApiError(err), type: "error" });
      if (String(getApiError(err)).toLowerCase().includes("serviceable")) {
        setPickerOpen(true);
      }
    } finally {
      setPending(false);
    }
  }

  function selectCity(next) {
    setLocation({ city: next, pincode: null, source: "manual" });
    setQuery("");
  }

  return (
    <>
      <CityChip
        city={city}
        pincode={pincode}
        source={source}
        onClick={() => setPickerOpen(true)}
      />
      <Dialog
        open={pickerOpen}
        onOpenChange={(open) => {
          setPickerOpen(open);
          if (!open) setQuery("");
        }}
      >
        <DialogContent className="gap-4 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select your area</DialogTitle>
            <DialogDescription>
              Use your location or pick a city for local pricing.
            </DialogDescription>
          </DialogHeader>
          <Button
            type="button"
            className="h-11 w-full rounded-full"
            disabled={pending}
            onClick={onDetectLocation}
          >
            {pending ? (
              <Spinner className="size-4" />
            ) : (
              <LocateFixedIcon className="size-4" />
            )}
            Use my location
          </Button>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search city"
              className="pl-9"
              autoComplete="off"
              disabled={pending}
            />
          </div>
          <ScrollArea className="h-[min(18rem,45vh)]">
            <div className="flex flex-col pr-2">
              {cities.length === 0 ? (
                <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                  No cities available yet.
                </p>
              ) : null}
              {cities.length > 0 && filtered.length === 0 ? (
                <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                  No city matches that search.
                </p>
              ) : null}
              {filtered.map((item) => {
                const selected = city?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={pending}
                    onClick={() => selectCity(item)}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted",
                      selected && "bg-muted",
                    )}
                  >
                    <MapPinIcon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{item.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {item.state}
                      </span>
                    </span>
                    {selected ? (
                      <CheckIcon className="size-4 shrink-0 text-foreground" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function LocationTriggerButton({ className }) {
  const city = useLocationStore((s) => s.city);
  const setPickerOpen = useLocationStore((s) => s.setPickerOpen);
  return (
    <Button className={className} onClick={() => setPickerOpen(true)}>
      {city ? "Change city" : "Select city"}
    </Button>
  );
}
