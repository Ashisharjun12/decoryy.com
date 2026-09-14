import { formatDistanceToNow } from "date-fns"
import { getNotificationIcon } from "@/module/notifications/lib/notification-icon"
import { cn } from "@/lib/utils"

export function NotificationRow({ item, onPress, compact = false }) {
  const unread = !item.readAt
  const Icon = getNotificationIcon(item.data?.event)
  const event = item.data?.event

  return (
    <button
      type="button"
      onClick={() => onPress(item)}
      className={cn(
        "w-full text-left transition-colors hover:bg-muted/50",
        compact ? "flex gap-3 rounded-xl px-3 py-2.5" : "rounded-xl border border-border p-4 hover:bg-muted/40",
        !compact && unread && "border-primary/30 bg-primary/5",
        compact && unread && "bg-primary/5",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 flex shrink-0 items-center justify-center rounded-full bg-muted",
            compact ? "size-8" : "size-9",
          )}
        >
          <Icon className="size-4 text-muted-foreground" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className={cn("font-medium", compact ? "text-sm" : "text-base")}>{item.title}</p>
            {unread ? <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" /> : null}
          </div>
          <p className={cn("text-muted-foreground", compact ? "mt-0.5 line-clamp-2 text-xs" : "mt-1 text-sm")}>
            {item.body}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
            {event && compact ? ` · ${event.replace(/_/g, " ").toLowerCase()}` : null}
          </p>
        </div>
      </div>
    </button>
  )
}
