import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HomeScrollControls({
  onPrev,
  onNext,
  canPrev = false,
  canNext = false,
  className,
}) {
  const buttonClass =
    "size-9 rounded-full border-0 bg-amber-400 text-amber-950 shadow-sm hover:bg-amber-500 disabled:opacity-40";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        type="button"
        variant="default"
        size="icon"
        className={buttonClass}
        disabled={!canPrev}
        onClick={onPrev}
        aria-label="Scroll left"
      >
        <ChevronLeftIcon className="size-4 stroke-[2.5]" />
      </Button>
      <Button
        type="button"
        variant="default"
        size="icon"
        className={buttonClass}
        disabled={!canNext}
        onClick={onNext}
        aria-label="Scroll right"
      >
        <ChevronRightIcon className="size-4 stroke-[2.5]" />
      </Button>
    </div>
  );
}
