import { useEffect, useState } from "react";
import { ArrowRightIcon, SparklesIcon } from "lucide-react";
import { formatPaise } from "@/lib/money";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DecoryImageFallback } from "@/components/decory-image-fallback";

function addonImageSrc(item) {
  return item?.url || item?.publicUrl || item?.optimizedUrl || item?.thumbnailUrl || "";
}

function discountPercent(pricePaise, compareAtPaise) {
  if (compareAtPaise == null || pricePaise == null || compareAtPaise <= pricePaise) {
    return 0;
  }
  return Math.round((1 - pricePaise / compareAtPaise) * 100);
}

function AddonPrice({ pricePaise, compareAtPaise }) {
  const isFree = pricePaise == null;
  const percentOff = discountPercent(pricePaise, compareAtPaise);
  const hasCompare = percentOff > 0;

  if (isFree) {
    return (
      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Free</p>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
        <span className="text-sm font-extrabold tabular-nums text-foreground">
          {formatPaise(pricePaise)}
        </span>
        {hasCompare ? (
          <span className="text-xs text-muted-foreground line-through tabular-nums">
            {formatPaise(compareAtPaise)}
          </span>
        ) : null}
      </div>
      {hasCompare ? (
        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
          {percentOff}% OFF
        </span>
      ) : null}
    </div>
  );
}

export function ProductCustomizeOrderDialog({
  open,
  onOpenChange,
  addons = [],
  submitting = false,
  onSkip,
  onProceed,
}) {
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (open) {
      setSelectedIds([]);
    }
  }, [open]);

  function toggle(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((row) => row !== id) : [...prev, id],
    );
  }

  const count = selectedIds.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[min(92dvh,720px)] w-full max-w-4xl flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl"
      >
        <DialogHeader className="gap-2 border-b border-border/60 px-5 py-4 text-left sm:px-6">
          <div className="flex items-start gap-3 pr-8">
            <span
              className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary"
              aria-hidden
            >
              <SparklesIcon className="size-5" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="font-heading text-lg font-semibold sm:text-xl">
                Customize your order
              </DialogTitle>
              <DialogDescription className="text-sm">
                Add extras to make it special
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {addons.map((addon) => {
              const src = addonImageSrc(addon.image);
              const isOn = selectedIds.includes(addon.id);
              return (
                <article
                  key={addon.id}
                  className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border/80 bg-card"
                >
                  <div className="relative aspect-square w-full bg-muted">
                    {src ? (
                      <img src={src} alt="" className="size-full object-cover" />
                    ) : (
                      <DecoryImageFallback />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-2.5">
                    <h3 className="line-clamp-2 min-h-[2.5em] text-xs font-semibold leading-snug sm:text-sm">
                      {addon.color?.name
                        ? `${addon.name} · ${addon.color.name}`
                        : addon.name}
                    </h3>
                    <AddonPrice
                      pricePaise={addon.pricePaise}
                      compareAtPaise={addon.compareAtPaise}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant={isOn ? "default" : "outline"}
                      className={cn(
                        "mt-auto w-full rounded-full text-xs font-bold",
                        !isOn && "border-primary text-primary hover:bg-primary/10",
                      )}
                      disabled={submitting}
                      onClick={() => toggle(addon.id)}
                    >
                      {isOn ? "Added" : "+ ADD"}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border/60 bg-muted/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
              Selected
            </p>
            <p className="font-heading text-base font-semibold">
              {count} add-on{count === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="secondary"
              className="rounded-full"
              disabled={submitting}
              onClick={() => onSkip?.()}
            >
              Skip
            </Button>
            <Button
              type="button"
              className="rounded-full"
              disabled={submitting}
              onClick={() => onProceed?.(selectedIds)}
            >
              {submitting ? "Adding…" : "Proceed to checkout"}
              {!submitting ? <ArrowRightIcon className="size-4" /> : null}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
