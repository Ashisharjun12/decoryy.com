import { EyeIcon, MoreHorizontalIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { formatPaise } from "@/lib/money"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { BookingStatusBadge } from "@/module/bookings/components/BookingStatusBadge"
import {
  clipCityLabel,
  clipText,
  formatBookingSlot,
  formatPaymentMethodShort,
} from "@/module/bookings/lib/booking-format"

const SKELETON_ROWS = 6
const TEXT_LIMIT = 9
const REFERENCE_LIMIT = 12
const SLOT_LIMIT = 14

function ClippedCell({ value, maxLength = TEXT_LIMIT, className, mono = false }) {
  const full = String(value ?? "").trim() || "—"
  const clipped = clipText(full, maxLength)

  return (
    <span
      className={mono ? `font-mono ${className ?? ""}` : className}
      title={full !== clipped ? full : undefined}
    >
      {clipped}
    </span>
  )
}

export function BookingsTable({ items, loading }) {
  const navigate = useNavigate()

  function openBooking(id) {
    navigate(`/bookings/${id}`)
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="w-full overflow-hidden">
      <Table className="w-full table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[11%]">Reference</TableHead>
            <TableHead className="w-[13%]">Setup slot</TableHead>
            <TableHead className="w-[11%]">City</TableHead>
            <TableHead className="w-[14%]">Customer</TableHead>
            <TableHead className="w-[9%]">Payment</TableHead>
            <TableHead className="w-[12%]">Status</TableHead>
            <TableHead className="w-[9%]">Total</TableHead>
            <TableHead className="w-[10%]">Assignee</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((booking) => {
            const slotFull = formatBookingSlot(booking.scheduledAt)
            const slotLabel = clipText(slotFull, SLOT_LIMIT)
            const cityFull = `${booking.cityName} · ${booking.pincode}`
            const cityLabel = clipCityLabel(booking.cityName, booking.pincode, TEXT_LIMIT)
            const assigneeFull = booking.assigneeName || "—"
            const assigneeLabel = clipText(assigneeFull, TEXT_LIMIT)

            return (
              <TableRow
                key={booking.id}
                className="cursor-pointer"
                onClick={() => openBooking(booking.id)}
              >
                <TableCell className="text-sm">
                  <ClippedCell
                    value={booking.reference}
                    maxLength={REFERENCE_LIMIT}
                    mono
                  />
                </TableCell>
                <TableCell className="text-sm" title={slotFull !== slotLabel ? slotFull : undefined}>
                  {slotLabel}
                </TableCell>
                <TableCell className="text-sm" title={cityFull !== cityLabel ? cityFull : undefined}>
                  {cityLabel}
                </TableCell>
                <TableCell className="text-sm">
                  <div className="font-medium">
                    <ClippedCell value={booking.customerName} maxLength={TEXT_LIMIT} />
                  </div>
                  <div className="text-muted-foreground">
                    <ClippedCell value={booking.customerPhone} maxLength={TEXT_LIMIT} mono />
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  <div className="flex flex-wrap items-center gap-1">
                    <span>{formatPaymentMethodShort(booking.paymentMethod)}</span>
                    {booking.source === "admin" ? (
                      <Badge variant="outline" className="text-[10px] px-1 py-0">
                        Admin
                      </Badge>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>
                  <BookingStatusBadge status={booking.status} className="max-w-full truncate" />
                </TableCell>
                <TableCell className="truncate tabular-nums text-sm">
                  ₹{formatPaise(booking.subtotalPaise)}
                </TableCell>
                <TableCell
                  className="text-sm text-muted-foreground"
                  title={assigneeFull !== assigneeLabel ? assigneeFull : undefined}
                >
                  {assigneeLabel}
                </TableCell>
                <TableCell onClick={(event) => event.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Actions for ${booking.reference}`}
                        />
                      }
                    >
                      <MoreHorizontalIcon />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openBooking(booking.id)}>
                        <EyeIcon />
                        View
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
