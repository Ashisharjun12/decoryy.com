import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ArrowRightIcon } from "lucide-react";
import { getLenis } from "@/lib/lenis-instance";
import { listTopLevelCategories } from "@/lib/category-icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEMO_BUDGETS,
} from "@/module/home/data/demo-categories";
import { useCatalogStore } from "@/store/catalog.store";
import { useLocationStore } from "@/store/location.store";

function Field({ label, children, className }) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col justify-center gap-0.5 rounded-2xl px-3 py-1.5 transition-colors hover:bg-muted/70 md:rounded-full md:px-5 md:py-2.5",
        className,
      )}
    >
      <span className="text-[9px] font-bold tracking-[0.08em] text-muted-foreground uppercase md:text-[10px]">
        {label}
      </span>
      {children}
    </div>
  );
}

const triggerClass =
  "h-auto w-full min-w-0 border-0 bg-transparent p-0 text-xs font-semibold shadow-none hover:bg-transparent focus-visible:border-transparent focus-visible:ring-0 md:text-sm dark:bg-transparent dark:hover:bg-transparent";

export function BannerSearch() {
  const city = useLocationStore((s) => s.city);
  const cities = useLocationStore((s) => s.cities);
  const setLocation = useLocationStore((s) => s.setLocation);
  const categories = useCatalogStore((s) => s.categories);
  const occasions = useMemo(
    () => listTopLevelCategories(categories),
    [categories],
  );
  const [occasion, setOccasion] = useState("");
  const [date, setDate] = useState(undefined);
  const [budget, setBudget] = useState("any");
  const cityId = city?.id ?? cities[0]?.id ?? "";

  useEffect(() => {
    if (!occasions.length) return;
    setOccasion((current) =>
      occasions.some((item) => item.slug === current)
        ? current
        : occasions[0].slug,
    );
  }, [occasions]);

  const occasionLabel =
    occasions.find((item) => item.slug === occasion)?.name ?? "Occasion";
  const cityLabel =
    cities.find((item) => item.id === cityId)?.name ?? city?.name ?? "City";
  const budgetLabel =
    DEMO_BUDGETS.find((item) => item.value === budget)?.label ?? "Budget";

  function findSetups() {
    const target = document.getElementById("trending");
    const lenis = getLenis();
    if (lenis && target) {
      lenis.scrollTo(target, { offset: -80 });
      return;
    }
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <form
      className="rounded-3xl border border-border bg-card p-1.5 shadow-md md:rounded-full md:p-1.5 md:shadow-lg"
      onSubmit={(event) => {
        event.preventDefault();
        findSetups();
      }}
    >
      <div className="grid grid-cols-2 items-center gap-0.5 md:grid-cols-[1fr_1fr_1fr_1fr_auto] md:gap-0">
        <Field label="Occasion">
          <Select value={occasion} onValueChange={setOccasion}>
            <SelectTrigger className={triggerClass} size="sm">
              <SelectValue placeholder="Occasion">{occasionLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent align="start" alignItemWithTrigger={false} className="min-w-44">
              {occasions.map((item) => (
                <SelectItem key={item.id} value={item.slug}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="City">
          <Select
            value={cityId || undefined}
            onValueChange={(value) => {
              const next = cities.find((item) => item.id === value);
              if (next) {
                setLocation({ city: next, pincode: null, source: "manual" });
              }
            }}
          >
            <SelectTrigger className={triggerClass} size="sm">
              <SelectValue placeholder="City">{cityLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent align="start" alignItemWithTrigger={false} className="min-w-44">
              {cities.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Date">
          <Popover>
            <PopoverTrigger
              type="button"
              className="h-auto w-full truncate text-left text-xs font-semibold md:text-sm"
            >
              {date ? format(date, "d MMM yyyy") : "Choose date"}
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto rounded-3xl p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={{ before: new Date() }}
              />
            </PopoverContent>
          </Popover>
        </Field>
        <Field label="Budget">
          <Select value={budget} onValueChange={setBudget}>
            <SelectTrigger className={triggerClass} size="sm">
              <SelectValue placeholder="Budget">{budgetLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent align="start" alignItemWithTrigger={false} className="min-w-44">
              {DEMO_BUDGETS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Button
          type="submit"
          className="col-span-2 mt-1 h-9 w-full rounded-full px-4 text-xs font-bold transition-transform hover:-translate-y-0.5 active:scale-[0.98] md:col-span-1 md:mt-0 md:mr-1 md:h-12 md:w-auto md:px-6 md:text-sm"
        >
          Find setups
          <ArrowRightIcon />
        </Button>
      </div>
    </form>
  );
}
