import { Link } from "react-router-dom";
import { MessageCircleIcon, PhoneIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function vendorInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function VendorContactCard({ assignee, orderId }) {
  return (
    <Card className="shadow-none ring-0">
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white"
            aria-hidden
          >
            {vendorInitials(assignee.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground">{assignee.name}</p>
            <p className="text-sm text-muted-foreground">Your decorator</p>
            {assignee.phone ? (
              <p className="mt-1 text-sm font-medium tabular-nums text-foreground">{assignee.phone}</p>
            ) : null}
          </div>
          {assignee.phone ? (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="shrink-0 flex-row items-center gap-1.5 whitespace-nowrap"
            >
              <a href={`tel:${assignee.phone}`} className="inline-flex items-center gap-1.5">
                <PhoneIcon className="size-4 shrink-0" />
                Call
              </a>
            </Button>
          ) : null}
        </div>
        <Button asChild className="h-11 w-full rounded-2xl text-base" size="lg">
          <Link
            to={`/account/bookings/${orderId}/chat`}
            className="inline-flex items-center justify-center gap-2">
            <MessageCircleIcon className="size-5 shrink-0" />
            Chat with vendor
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
