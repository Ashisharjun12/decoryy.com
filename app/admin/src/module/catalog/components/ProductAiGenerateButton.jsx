import { CheckIcon, InfoIcon, SparklesIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { getCatalogAiRequirementChecks } from "@/module/catalog/lib/catalog-ai-gate"

export function ProductAiGenerateButton({
  aiPolicy,
  name,
  parentCategoryId,
  categoryId,
  categoryName,
  loading = false,
  submitting = false,
  onClick,
}) {
  const checks = getCatalogAiRequirementChecks(aiPolicy, {
    name,
    parentCategoryId,
    categoryId,
    categoryName,
  })
  const pending = checks.filter((check) => !check.done)
  const ready = pending.length === 0 && !loading
  const disabled = !ready || submitting
  const isPolicyBlock = checks.length === 1 && checks[0].kind === "policy"

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={onClick}
        className={cn(
          ready &&
            "border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/10 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200",
        )}
      >
        <SparklesIcon />
        Generate with AI
      </Button>

      <Popover>
        <PopoverTrigger
          render={
            <button
              type="button"
              className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="AI generation requirements"
            >
              <InfoIcon className="size-3.5" />
            </button>
          }
        />
        <PopoverContent align="end" side="bottom" className="w-56 gap-3 p-3">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading AI settings…</p>
          ) : ready ? (
            <PopoverHeader className="gap-1">
              <PopoverTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Ready to generate
              </PopoverTitle>
              <PopoverDescription className="text-xs">
                SEO-friendly copy for name, slug, includes, and FAQs.
              </PopoverDescription>
            </PopoverHeader>
          ) : isPolicyBlock ? (
            <PopoverHeader className="gap-1">
              <PopoverTitle className="text-sm font-medium">AI not available</PopoverTitle>
              <PopoverDescription className="text-xs leading-relaxed">
                {checks[0].label}
              </PopoverDescription>
            </PopoverHeader>
          ) : (
            <>
              <PopoverHeader className="gap-1">
                <PopoverTitle className="text-sm font-medium">Required fields</PopoverTitle>
                <PopoverDescription className="text-xs">
                  Fill these in on the form first.
                </PopoverDescription>
              </PopoverHeader>
              <ul className="flex flex-col gap-1.5">
                {checks.map((check) => (
                  <li key={check.label} className="flex items-center gap-2 text-sm">
                    {check.done ? (
                      <CheckIcon className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <span className="size-3.5 shrink-0" aria-hidden="true" />
                    )}
                    <span
                      className={cn(
                        check.done
                          ? "text-muted-foreground"
                          : "text-popover-foreground",
                      )}
                    >
                      {check.label}
                      {!check.done ? <span className="text-destructive"> *</span> : null}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
