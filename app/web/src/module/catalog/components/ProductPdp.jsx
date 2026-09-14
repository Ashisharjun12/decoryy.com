import { useEffect, useMemo, useState } from "react";
import { addDays, format, isSameDay, startOfToday } from "date-fns";
import {
  CalendarDaysIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CircleHelpIcon,
  ClockIcon,
  FlameIcon,
  MapPinIcon,
  PackageIcon,
  SparklesIcon,
  TruckIcon,
} from "lucide-react";
import { formatPaise } from "@/lib/money";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { getApiError } from "@/api/api";
import { useCartStore } from "@/store/cart.store";
import { isBackendCityId, useLocationStore } from "@/store/location.store";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DecoryImageFallback } from "@/components/decory-image-fallback";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductReviewsPreview } from "@/module/catalog/components/reviews/ProductReviewsPreview";

const TIME_SLOTS = [
  { id: "9-12", label: "9 AM – 12 PM" },
  { id: "12-3", label: "12 PM – 3 PM" },
  { id: "3-6", label: "3 PM – 6 PM", fillingFast: true },
  { id: "6-9", label: "6 PM – 9 PM" },
  { id: "9-11", label: "9 PM – 11 PM" },
];

const SCROLL_X =
  "flex min-w-0 w-full gap-2 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

function imageSrc(item) {
  return item?.url || item?.publicUrl || item?.optimizedUrl || item?.thumbnailUrl || "";
}

function thumbSrc(item) {
  return item?.thumbnailUrl || item?.url || item?.publicUrl || item?.optimizedUrl || "";
}

function galleryImages(images) {
  return (images ?? []).filter((item) => item.kind !== "video");
}

function filledPoints(items) {
  return (items ?? []).map((item) => String(item).trim()).filter(Boolean);
}

function filledFaqs(items) {
  return (items ?? []).filter((item) => (item.question ?? "").trim() && (item.answer ?? "").trim());
}

function comingSoon() {
  toast.add({ title: "Coming soon", type: "info" });
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function IncludedList({ items }) {
  const points = filledPoints(items);
  if (!points.length) {
    return <p className="text-muted-foreground">Details coming soon</p>;
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {points.map((point, index) => (
        <li key={`${index}-${point}`} className="flex gap-2">
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-600/15 text-emerald-600 dark:text-emerald-400">
            <CheckIcon className="size-3.5" />
          </span>
          <span>{point}</span>
        </li>
      ))}
    </ul>
  );
}

function BulletList({ items }) {
  const points = filledPoints(items);
  if (!points.length) {
    return <p className="text-muted-foreground">Details coming soon</p>;
  }
  return (
    <ul className="list-disc space-y-2 pl-5">
      {points.map((point, index) => (
        <li key={`${index}-${point}`}>{point}</li>
      ))}
    </ul>
  );
}

function SectionTrigger({ icon, iconClassName, title, subtitle }) {
  return (
    <AccordionTrigger className="items-center gap-3 hover:no-underline **:data-[slot=accordion-trigger-icon]:hidden">
      <span className="flex min-w-0 flex-1 items-center gap-3">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full",
            iconClassName,
          )}
        >
          {icon}
        </span>
        <span className="flex min-w-0 flex-col text-left">
          <span>{title}</span>
          {subtitle ? (
            <span className="text-sm font-normal text-muted-foreground">{subtitle}</span>
          ) : null}
        </span>
      </span>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-background text-foreground group-aria-expanded/accordion-trigger:border-transparent group-aria-expanded/accordion-trigger:bg-primary group-aria-expanded/accordion-trigger:text-primary-foreground">
        <ChevronDownIcon className="size-4 group-aria-expanded/accordion-trigger:hidden" />
        <ChevronUpIcon className="hidden size-4 group-aria-expanded/accordion-trigger:inline" />
      </span>
    </AccordionTrigger>
  );
}

function ProductPrice({ pricePaise, compareAtPaise }) {
  if (pricePaise == null) {
    return <p className="text-muted-foreground">Price unavailable</p>;
  }

  const savedPaise =
    compareAtPaise != null && compareAtPaise > pricePaise ? compareAtPaise - pricePaise : 0;
  const percentOff =
    compareAtPaise != null && compareAtPaise > pricePaise
      ? Math.round((1 - pricePaise / compareAtPaise) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="font-heading text-2xl font-medium tracking-tight">
          {formatPaise(pricePaise)}
        </span>
        {compareAtPaise != null && compareAtPaise > pricePaise ? (
          <span className="text-muted-foreground line-through">
            {formatPaise(compareAtPaise)}
          </span>
        ) : null}
        {percentOff > 0 ? (
          <Badge className="bg-emerald-600/15 text-emerald-700 dark:text-emerald-400">
            {percentOff}% off
          </Badge>
        ) : null}
      </div>
      {savedPaise > 0 ? (
        <p className="text-sm">
          <span className="font-medium text-emerald-700 dark:text-emerald-400">
            You save {formatPaise(savedPaise)}
          </span>
          <span className="text-muted-foreground"> · Inclusive of all charges and setup</span>
        </p>
      ) : null}
    </div>
  );
}

function ProductGallery({ images, title }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = images[selectedIndex] ?? images[0] ?? null;
  const src = imageSrc(selected);

  useEffect(() => {
    setSelectedIndex((index) => {
      if (!images.length) return 0;
      return Math.min(index, images.length - 1);
    });
  }, [images]);

  function step(delta) {
    if (images.length < 2) return;
    setSelectedIndex((index) => (index + delta + images.length) % images.length);
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="relative min-w-0 overflow-hidden rounded-4xl bg-muted">
        {src ? (
          <img
            src={src}
            alt={title}
            className="aspect-square w-full max-w-full object-cover"
          />
        ) : (
          <DecoryImageFallback className="aspect-square min-h-64" />
        )}
        {images.length > 1 ? (
          <>
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              className="absolute top-1/2 left-3 -translate-y-1/2"
              onClick={() => step(-1)}
              aria-label="Previous image"
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              className="absolute top-1/2 right-3 -translate-y-1/2"
              onClick={() => step(1)}
              aria-label="Next image"
            >
              <ChevronRightIcon />
            </Button>
          </>
        ) : null}
      </div>
      {images.length > 1 ? (
        <div className={SCROLL_X}>
          {images.map((item, index) => {
            const thumb = thumbSrc(item);
            return (
              <button
                key={item.uploadId || item.url || index}
                type="button"
                onClick={() => setSelectedIndex(index)}
                aria-label={`Show image ${index + 1}`}
                aria-pressed={index === selectedIndex}
                className={cn(
                  "size-16 shrink-0 overflow-hidden rounded-2xl bg-muted ring-2 ring-transparent",
                  index === selectedIndex && "ring-primary",
                )}
              >
                {thumb ? (
                  <img src={thumb} alt="" className="size-full object-cover" />
                ) : (
                  <DecoryImageFallback />
                )}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function ProductSchedule({ onChange }) {
  const today = useMemo(() => startOfToday(), []);
  const dates = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(today, i)), [today]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [slot, setSlot] = useState("9-12");
  const [moreOpen, setMoreOpen] = useState(false);
  const inStrip = dates.some((date) => isSameDay(date, selectedDate));

  useEffect(() => {
    if (!onChange) return;
    const hour =
      slot === "9-12" ? 9 : slot === "12-3" ? 12 : slot === "3-6" ? 15 : slot === "6-9" ? 18 : 21;
    const scheduled = new Date(selectedDate);
    scheduled.setHours(hour, 0, 0, 0);
    onChange(scheduled.toISOString());
  }, [selectedDate, slot, onChange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose date and time</CardTitle>
        <CardDescription>When should we arrive to set up?</CardDescription>
      </CardHeader>
      <CardContent className="flex min-w-0 flex-col gap-4">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Select date
          </p>
          <div className={SCROLL_X}>
            {dates.map((date) => {
              const selected = isSameDay(date, selectedDate);
              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    "flex min-w-14 shrink-0 flex-col items-center rounded-2xl border px-2 py-2 text-xs",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:bg-muted",
                  )}
                >
                  <span className="uppercase">{format(date, "EEE")}</span>
                  <span className="font-heading text-base font-medium">{format(date, "d")}</span>
                  <span>{format(date, "MMM")}</span>
                </button>
              );
            })}
            <Popover open={moreOpen} onOpenChange={setMoreOpen}>
              <PopoverTrigger
                type="button"
                className={cn(
                  "inline-flex h-auto min-w-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl border px-2 py-2 text-xs font-medium transition-colors",
                  inStrip
                    ? "border-border bg-background hover:bg-muted"
                    : "border-primary bg-primary text-primary-foreground",
                )}
              >
                <CalendarDaysIcon className="size-4" />
                {inStrip ? "More dates" : format(selectedDate, "d MMM")}
              </PopoverTrigger>
              <PopoverContent align="end" className="w-auto p-2">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (!date) return;
                    setSelectedDate(date);
                    setMoreOpen(false);
                  }}
                  disabled={{ before: today }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="min-w-0">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Select time
            </p>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <ClockIcon className="size-3.5" />
              3-hr window
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {TIME_SLOTS.map((item) => {
              const selected = slot === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setSlot(item.id)}
                  className={cn(
                    "flex w-full min-w-0 flex-col items-center justify-center gap-1 rounded-2xl border border-black/10 bg-background px-1 py-2 text-center shadow-none transition-colors dark:border-white/15",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:bg-muted/60",
                  )}
                >
                  <span
                    className={cn(
                      "text-[11px] leading-none font-semibold whitespace-nowrap sm:text-xs",
                      selected ? "text-primary-foreground" : "text-foreground",
                    )}
                  >
                    {item.label}
                  </span>
                  {item.fillingFast ? (
                    <span
                      className={cn(
                        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[8px] font-bold tracking-wide uppercase",
                        selected
                          ? "bg-white/20 text-primary-foreground"
                          : "bg-rose-600 text-white",
                      )}
                    >
                      <FlameIcon className="size-2.5" />
                      Filling fast
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
          <p className="mt-2.5 flex items-start gap-2 text-xs text-muted-foreground">
            <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
              <CheckIcon className="size-2.5" strokeWidth={3} />
            </span>
            <span>
              Our team <span className="font-medium text-foreground">arrives &amp; completes the setup</span>{" "}
              within your selected time slot.
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ProductAddons({ addons, selectedIds, onToggle }) {
  const rows = addons ?? [];
  const selected = new Set(selectedIds ?? []);

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <h3 className="font-heading text-base font-medium">We suggest to add this</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No add-ons for this setup</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((addon) => {
            const thumb = imageSrc(addon.image);
            const isOn = selected.has(addon.id);
            return (
              <li key={addon.id} className="flex min-w-0 items-center gap-3">
                <span className="relative size-12 shrink-0 overflow-hidden rounded-full bg-muted">
                  {thumb ? (
                    <img src={thumb} alt="" className="size-full object-cover" />
                  ) : (
                    <DecoryImageFallback />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  {addon.color?.name ? (
                    <p className="flex min-w-0 items-center gap-1.5 font-medium">
                      <span
                        className="size-3.5 shrink-0 rounded-full border border-black/10"
                        style={{ backgroundColor: addon.color.hex }}
                        aria-hidden
                      />
                      <span className="truncate">
                        {addon.name} · {addon.color.name}
                      </span>
                    </p>
                  ) : (
                    <p className="truncate font-medium">{addon.name}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {addon.pricePaise == null ? "Free" : formatPaise(addon.pricePaise)}
                  </p>
                </div>
                <Button
                  type="button"
                  size="lg"
                  variant={isOn ? "default" : "outline"}
                  onClick={() => onToggle?.(addon.id)}
                >
                  {isOn ? "Selected" : "Select"}
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function ProductPdp({ product, onChangeLocation }) {
  const images = useMemo(() => galleryImages(product?.images), [product?.images]);
  const title = (product?.name ?? "").trim() || "Product";
  const copy = (product?.description ?? "").trim();
  const faqItems = filledFaqs(product?.faqs);
  const includePoints = filledPoints(product?.includes);
  const cityLabel = (product?.city?.name ?? "").trim() || "Select city";
  const [selectedAddonIds, setSelectedAddonIds] = useState([]);
  const [scheduledAt, setScheduledAt] = useState(null);
  const [booking, setBooking] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const city = useLocationStore((s) => s.city);
  const pincode = useLocationStore((s) => s.pincode);
  const setPickerOpen = useLocationStore((s) => s.setPickerOpen);

  const selectedAddons = useMemo(() => {
    const ids = new Set(selectedAddonIds);
    return (product?.addons ?? []).filter((addon) => ids.has(addon.id));
  }, [product?.addons, selectedAddonIds]);

  const addonsPaise = useMemo(
    () =>
      selectedAddons.reduce((sum, addon) => sum + (addon.pricePaise ?? 0), 0),
    [selectedAddons],
  );

  const packageTotalPaise =
    product?.pricePaise != null ? product.pricePaise + addonsPaise : null;

  function toggleAddon(id) {
    setSelectedAddonIds((prev) =>
      prev.includes(id) ? prev.filter((row) => row !== id) : [...prev, id],
    );
  }

  async function onBookNow() {
    if (!product?.id) return;
    const hasLocation =
      Boolean(pincode?.code) || (Boolean(city?.id) && isBackendCityId(city.id));
    if (!hasLocation) {
      setPickerOpen(true);
      toast.add({ title: "Select your city first", type: "info" });
      return;
    }
    setBooking(true);
    try {
      await addItem({
        productId: product.id,
        addonIds: selectedAddonIds,
        quantity: 1,
        pincode: pincode?.code || undefined,
        cityId: pincode?.code ? undefined : city?.id,
        scheduledAt: scheduledAt || undefined,
      });
      toast.add({ title: "Added to bag", type: "success" });
    } catch (err) {
      toast.add({ title: getApiError(err), type: "error" });
    } finally {
      setBooking(false);
    }
  }

  return (
    <div className="grid min-w-0 gap-6 overflow-x-hidden lg:grid-cols-2">
      <div className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
        <ProductGallery images={images} title={title} />
        <ProductAddons
          addons={product?.addons}
          selectedIds={selectedAddonIds}
          onToggle={toggleAddon}
        />
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="font-heading text-2xl font-medium tracking-tight">{title}</h1>
          <p
            className={cn(
              "text-sm",
              copy ? "whitespace-pre-wrap text-foreground" : "text-muted-foreground",
            )}
          >
            {copy || "No description"}
          </p>
        </div>

        <ProductPrice
          pricePaise={product?.pricePaise}
          compareAtPaise={product?.compareAtPaise}
        />

        {packageTotalPaise != null && selectedAddons.length > 0 ? (
          <div className="flex min-w-0 items-baseline justify-between gap-3 rounded-4xl border border-emerald-600/20 bg-emerald-600/5 px-4 py-3">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Package total</p>
              <p className="text-sm text-muted-foreground">
                Setup
                {addonsPaise > 0
                  ? ` + ${selectedAddons.length} add-on${selectedAddons.length === 1 ? "" : "s"}`
                  : ` + ${selectedAddons.length} free add-on${selectedAddons.length === 1 ? "" : "s"}`}
              </p>
            </div>
            <p className="shrink-0 text-lg font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
              {formatPaise(packageTotalPaise)}
            </p>
          </div>
        ) : null}

        <div className="flex min-w-0 items-center justify-between gap-3 rounded-4xl bg-emerald-600/10 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <MapPinIcon className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="truncate font-medium">{cityLabel}</span>
            <Badge className="bg-emerald-600/15 text-emerald-700 dark:text-emerald-400">
              Available
            </Badge>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onChangeLocation}>
            Change
          </Button>
        </div>

        <ProductSchedule onChange={setScheduledAt} />

        <div className="flex min-w-0 flex-wrap gap-2">
          <Button
            type="button"
            size="lg"
            className="min-w-0 flex-1 bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white sm:min-w-40 [&_svg]:size-5"
            onClick={comingSoon}
          >
            <WhatsAppIcon />
            WhatsApp
          </Button>
          <Button
            type="button"
            size="lg"
            className="min-w-0 flex-1 sm:min-w-40 [&_svg]:size-5"
            disabled={booking}
            onClick={onBookNow}
          >
            {booking
              ? "Adding…"
              : packageTotalPaise != null
                ? `Book Now · ${formatPaise(packageTotalPaise)}`
                : "Book Now"}
          </Button>
        </div>

        <Accordion multiple defaultValue={["includes"]} className="rounded-4xl border bg-card">
          <AccordionItem value="includes" className="data-open:bg-transparent">
            <SectionTrigger
              icon={<PackageIcon className="size-4" />}
              iconClassName="bg-emerald-600/15 text-emerald-600 dark:text-emerald-400"
              title="What’s included"
              subtitle={
                includePoints.length
                  ? `${includePoints.length} items in your setup`
                  : "Details coming soon"
              }
            />
            <AccordionContent>
              <IncludedList items={product?.includes} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="faqs" className="data-open:bg-transparent">
            <SectionTrigger
              icon={<CircleHelpIcon className="size-4" />}
              iconClassName="bg-amber-500/15 text-amber-600 dark:text-amber-400"
              title="FAQs"
              subtitle={
                faqItems.length ? `${faqItems.length} common questions` : "Details coming soon"
              }
            />
            <AccordionContent>
              {faqItems.length ? (
                <Accordion multiple className="rounded-none border-none">
                  {faqItems.map((item, index) => (
                    <AccordionItem
                      key={item.key || `${index}-${item.question}`}
                      value={item.key || String(index)}
                      className="mb-2 rounded-2xl border-none bg-muted last:mb-0 data-open:bg-muted"
                    >
                      <AccordionTrigger className="text-foreground hover:no-underline">
                        {item.question.trim()}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        <p className="whitespace-pre-wrap">{item.answer.trim()}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-muted-foreground">Details coming soon</p>
              )}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="delivery" className="data-open:bg-transparent">
            <SectionTrigger
              icon={<TruckIcon className="size-4" />}
              iconClassName="bg-blue-600/15 text-blue-600 dark:text-blue-400"
              title="Delivery and setup"
              subtitle="How and when we arrive"
            />
            <AccordionContent>
              <BulletList items={product?.deliverySetup} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="care" className="data-open:bg-transparent">
            <SectionTrigger
              icon={<SparklesIcon className="size-4" />}
              iconClassName="bg-primary/15 text-primary"
              title="Care instructions"
              subtitle="Keep your décor looking great"
            />
            <AccordionContent>
              <BulletList items={product?.careInstructions} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <ProductReviewsPreview productId={product?.id} product={product} />
      </div>
    </div>
  );
}

export function ProductPdpSkeleton() {
  return (
    <div className="grid min-w-0 gap-6 overflow-x-hidden lg:grid-cols-2" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading product</span>
      <div className="flex min-w-0 flex-col gap-6">
        <div className="flex min-w-0 flex-col gap-3">
          <Skeleton className="aspect-square w-full rounded-4xl" />
          <div className="flex gap-2">
            <Skeleton className="size-16 shrink-0 rounded-2xl" />
            <Skeleton className="size-16 shrink-0 rounded-2xl" />
            <Skeleton className="size-16 shrink-0 rounded-2xl" />
            <Skeleton className="size-16 shrink-0 rounded-2xl" />
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-3">
          <Skeleton className="h-5 w-44 rounded-md" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-12 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-[70%] rounded-md" />
                <Skeleton className="h-3 w-16 rounded-md" />
              </div>
              <Skeleton className="h-10 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <Skeleton className="h-8 w-[85%] rounded-md" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-[72%] rounded-md" />
        </div>
        <Skeleton className="h-8 w-32 rounded-md" />
        <Skeleton className="h-14 w-full rounded-4xl" />
        <div className="rounded-4xl border bg-card p-4">
          <Skeleton className="h-5 w-40 rounded-md" />
          <Skeleton className="mt-2 h-3 w-52 rounded-md" />
          <div className="mt-4 flex gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-14 shrink-0 rounded-2xl" />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 rounded-2xl" />
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-11 flex-1 rounded-full" />
          <Skeleton className="h-11 flex-1 rounded-full" />
        </div>
        <div className="space-y-2 rounded-4xl border bg-card p-4">
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
