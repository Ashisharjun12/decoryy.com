import { useEffect, useMemo, useState } from "react";
import {
  CheckIcon,
  ChevronDownIcon,
  LocateFixedIcon,
  MapPinIcon,
  SearchIcon,
} from "lucide-react";
import { getApiError } from "@/api/api";
import { getLenis } from "@/lib/lenis-instance";
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
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { detectLocationFromDevice } from "@/module/geo/detect-location";
import {
  formatLocationLabel,
  useLocationStore,
} from "@/store/location.store";

function CityChip({
  city,
  pincode,
  source,
  className,
  pinClassName,
  labelClassName,
  chevronClassName,
  ...props
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-10 max-w-[13rem] cursor-pointer items-center gap-1.5 rounded-full border border-border bg-background px-3.5 text-left text-[13.5px] transition-shadow hover:border-primary hover:shadow-sm sm:max-w-none",
        className,
      )}
      {...props}
    >
      <MapPinIcon
        className={cn("size-3.5 shrink-0 text-muted-foreground", pinClassName)}
      />
      <span className={cn("min-w-0 truncate font-bold", labelClassName)}>
        {formatLocationLabel(city, pincode, source)}
      </span>
      <ChevronDownIcon
        className={cn("size-3.5 shrink-0 text-muted-foreground", chevronClassName)}
      />
    </button>
  );
}

export function LocationPicker({ variant = "default" }) {
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

  useEffect(() => {
    if (!pickerOpen) return undefined;

    const lenis = getLenis();
    lenis?.stop();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      lenis?.start();
    };
  }, [pickerOpen]);

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
        className={
          variant === "onBrand" || variant === "onHero"
            ? "h-auto max-w-[10.5rem] border-0 bg-transparent px-0 py-0 shadow-none hover:border-0 hover:bg-transparent hover:shadow-none"
            : undefined
        }
        pinClassName={
          variant === "onBrand"
            ? "text-primary-foreground/80"
            : variant === "onHero"
              ? "text-primary"
              : undefined
        }
        labelClassName={
          variant === "onBrand"
            ? "text-sm font-semibold text-primary-foreground"
            : variant === "onHero"
              ? "text-sm font-semibold text-background"
              : undefined
        }
        chevronClassName={
          variant === "onBrand"
            ? "text-primary-foreground/70"
            : variant === "onHero"
              ? "text-background/70"
              : undefined
        }
      />
      <Dialog
        open={pickerOpen}
        onOpenChange={(open) => {
          setPickerOpen(open);
          if (!open) setQuery("");
        }}
      >
        <DialogContent
          className="top-[12vh] flex max-h-[min(32rem,85vh)] translate-y-0 flex-col gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-[min(100%-1.25rem,26rem)]"
        >
          <div className="shrink-0 px-4 pt-5 pr-12 pb-3">
            <DialogHeader className="gap-1 text-left">
              <DialogTitle className="font-heading text-lg">Select your area</DialogTitle>
              <DialogDescription>
                Use your location or pick a city for local pricing and availability.
              </DialogDescription>
            </DialogHeader>

            <Button
              type="button"
              className="mt-4 h-11 w-full rounded-full font-semibold"
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

            <div className="relative mt-3">
              <SearchIcon
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search city or state"
                className="h-11 rounded-2xl border-border/60 bg-muted/40 pl-10 shadow-none"
                autoComplete="off"
                disabled={pending}
              />
            </div>

            <p className="mt-3 px-0.5 text-xs font-medium text-muted-foreground">
              Cities we serve
            </p>
          </div>

          <div
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-3"
            data-lenis-prevent
          >
            {cities.length === 0 ? (
              <p className="px-2 py-8 text-center text-sm text-muted-foreground">
                No cities available yet.
              </p>
            ) : null}
            {cities.length > 0 && filtered.length === 0 ? (
              <p className="px-2 py-8 text-center text-sm text-muted-foreground">
                No city matches that search.
              </p>
            ) : null}
            <ul className="flex flex-col gap-0.5">
              {filtered.map((item) => {
                const selected = city?.id === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => selectCity(item)}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2.5 text-left text-sm transition-colors hover:bg-muted/80",
                        selected && "bg-muted ring-1 ring-border/60",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-md bg-muted",
                          selected && "bg-primary/15",
                        )}
                      >
                        <MapPinIcon
                          className={cn(
                            "size-4 text-muted-foreground",
                            selected && "text-primary",
                          )}
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium text-foreground">
                          {item.name}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {item.state}
                        </span>
                      </span>
                      {selected ? (
                        <CheckIcon className="size-4 shrink-0 text-primary" aria-hidden />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
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
