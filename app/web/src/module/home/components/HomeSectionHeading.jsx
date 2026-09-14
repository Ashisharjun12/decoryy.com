import { cn } from "@/lib/utils";

export function HomeSectionHeading({ title, subtitle, className }) {
  return (
    <div className={cn("min-w-0", className)}>
      <h2 className="font-heading text-[clamp(1.25rem,2.4vw,1.75rem)] font-extrabold tracking-tight">
        {title}
      </h2>
      <span className="mt-1.5 block h-1 w-8 rounded-full bg-primary" aria-hidden />
      {subtitle ? (
        <p className="mt-2 max-w-[460px] text-[14px] text-muted-foreground">{subtitle}</p>
      ) : null}
    </div>
  );
}
