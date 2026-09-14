import { Link } from "react-router-dom"
import { ArrowRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BookingsTable } from "@/module/bookings/components/BookingsTable"

export function RecentBookingsCard({ items = [], loading }) {
  const isEmpty = !loading && items.length === 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle>Recent bookings</CardTitle>
          <CardDescription>Latest orders across the platform</CardDescription>
        </div>
        <Button variant="ghost" size="sm" render={<Link to="/bookings" />}>
          View all
          <ArrowRightIcon className="size-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            No bookings yet. New orders will appear here.
          </div>
        ) : (
          <BookingsTable items={items} loading={loading} />
        )}
      </CardContent>
    </Card>
  )
}
