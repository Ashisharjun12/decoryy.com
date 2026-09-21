import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  dispatchStatusLabel,
  dispatchStatusVariant,
  fulfillmentTypeLabel,
} from "@/module/bookings/lib/instant-dispatch-ui"

export function BookingInstantDispatchCard({ order }) {
  if (!order || order.fulfillmentType !== "instant") {
    return null
  }

  const exhausted = order.dispatchStatus === "exhausted"

  return (
    <Card className={exhausted ? "border-destructive/40" : undefined}>
      <CardHeader>
        <CardTitle className="text-base">Instant dispatch</CardTitle>
        <CardDescription>
          Auto-dispatch status for this booking. Exhausted orders need manual vendor assign.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{fulfillmentTypeLabel(order.fulfillmentType)}</Badge>
        <Badge variant={dispatchStatusVariant(order.dispatchStatus)}>
          {dispatchStatusLabel(order.dispatchStatus)}
        </Badge>
        {exhausted ? (
          <p className="w-full text-sm text-muted-foreground">
            No vendor accepted within the configured offer limit. Use Assign vendor above.
          </p>
        ) : null}
        {order.dispatchStatus === "offering" && order.assignee?.vendorResponse === "pending" ? (
          <p className="w-full text-sm text-muted-foreground">
            Waiting for {order.assignee?.name ?? "assigned vendor"} to accept or decline.
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
