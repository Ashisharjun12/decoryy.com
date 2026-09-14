import { MailIcon, PhoneIcon, UserIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

function ContactRow({ icon: Icon, label, value }) {
  const display = value?.trim?.() ? value.trim() : "—"

  return (
    <div className="flex items-start gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/60">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium break-words">{display}</p>
      </div>
    </div>
  )
}

export function BookingCustomerCard({ customer }) {
  const name = customer?.name?.trim?.() ?? ""
  const email = customer?.email?.trim?.() ?? ""
  const phone = customer?.phone?.trim?.() ?? ""
  const hasDetails = Boolean(name || email || phone)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Customer</CardTitle>
      </CardHeader>
      <CardContent>
        {hasDetails ? (
          <div className="space-y-4">
            <ContactRow icon={UserIcon} label="Name" value={name} />
            <ContactRow icon={MailIcon} label="Email" value={email} />
            <ContactRow icon={PhoneIcon} label="Phone" value={phone} />
          </div>
        ) : (
          <Empty className="border-0 p-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UserIcon />
              </EmptyMedia>
              <EmptyTitle>No customer details</EmptyTitle>
              <EmptyDescription>
                Contact information was not captured for this booking.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}
