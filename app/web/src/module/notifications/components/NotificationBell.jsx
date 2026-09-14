import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { BellIcon } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Spinner } from "@/components/ui/spinner"
import { NotificationRow } from "@/module/notifications/components/NotificationRow"
import { useUserNotifications } from "@/module/notifications/hooks/use-user-notifications"
import { resolveNotificationTarget } from "@/module/notifications/lib/resolve-notification-target"
import { cn } from "@/lib/utils"

const PREVIEW_LIMIT = 8

export function NotificationBell({ className }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [shaking, setShaking] = useState(false)
  const lastIncomingRef = useRef(0)
  const {
    notifications,
    unreadCount,
    loading,
    error,
    lastIncomingAt,
    refetch,
    markRead,
    markAllRead,
  } = useUserNotifications()

  const preview = notifications.slice(0, PREVIEW_LIMIT)

  useEffect(() => {
    if (!lastIncomingAt || lastIncomingAt === lastIncomingRef.current) return
    lastIncomingRef.current = lastIncomingAt
    setShaking(true)
    const timer = window.setTimeout(() => setShaking(false), 500)
    return () => window.clearTimeout(timer)
  }, [lastIncomingAt])

  async function handlePress(item) {
    if (!item.readAt) {
      try {
        await markRead(item.id)
      } catch {
        // still navigate
      }
    }
    setOpen(false)
    navigate(resolveNotificationTarget(item.data ?? {}))
  }

  async function handleMarkAllRead() {
    if (unreadCount === 0) return
    try {
      await markAllRead()
    } catch {
      // ignore
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        aria-label="Notifications"
        className={cn(
          "relative inline-flex size-9 shrink-0 items-center justify-center rounded-4xl border border-transparent bg-clip-padding text-sm font-medium transition-all outline-none select-none hover:bg-muted hover:text-foreground",
          className,
        )}
      >
        <motion.span
          animate={shaking ? { rotate: [0, -12, 12, -8, 8, 0] } : { rotate: 0 }}
          transition={{ duration: 0.45 }}
          className="inline-flex"
        >
          <BellIcon className="size-5" />
        </motion.span>
        <AnimatePresence>
          {unreadCount > 0 ? (
            <motion.span
              key={unreadCount}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[min(100vw-2rem,380px)] gap-0 p-0">
        <PopoverHeader className="flex-row items-center justify-between gap-3 border-b border-border px-4 py-3">
          <PopoverTitle>Notifications</PopoverTitle>
          {unreadCount > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 rounded-full px-2.5 text-xs"
              onClick={() => void handleMarkAllRead()}
            >
              Mark all read
            </Button>
          ) : null}
        </PopoverHeader>

        <div className="max-h-[min(70vh,420px)] overflow-y-auto p-2">
          {loading && notifications.length === 0 ? (
            <div className="flex justify-center py-10">
              <Spinner className="size-6" />
            </div>
          ) : error ? (
            <div className="px-3 py-8 text-center">
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-3 rounded-full"
                onClick={() => void refetch()}
              >
                Retry
              </Button>
            </div>
          ) : preview.length === 0 ? (
            <div className="px-3 py-10 text-center">
              <p className="text-sm text-muted-foreground">You&apos;re all caught up.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {preview.map((item) => (
                <NotificationRow
                  key={item.id}
                  item={item}
                  compact
                  onPress={handlePress}
                />
              ))}
            </div>
          )}
        </div>

        {notifications.length > 0 ? (
          <div className="border-t border-border px-4 py-3">
            <Link
              to="/account/notifications"
              onClick={() => setOpen(false)}
              className={buttonVariants({
                variant: "secondary",
                className: "h-9 w-full rounded-full",
              })}
            >
              View all notifications
            </Link>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}
